using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Objects.DataClasses;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using TimeTrackingAPI.Models;


namespace TimeTrackingAPI.Controllers
{
    public enum PayPeriodEnum
    {
        Today,
        This_Week,
        This_Month,
        Yesterday,
        Last_Week,
        Last_Month
    }

  public static class LinqHelper
  {
      [EdmFunction("Edm", "TruncateTime")]
      public static DateTime? TruncateTime(DateTime? date)
      {
          return date.HasValue ? date.Value.Date : (DateTime?)null;
      }
  }

    public class ProjectController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        [Route("~/api/GetProjectsByPayPeriod")]
        public dynamic GetProjectsByPayPeriod(string payperiod, string useremail)
        {

            var ProjectList = from p in db.Projects
                           where p.fldUserEmail == useremail
                           select new
                           {
                               p.fldProjectId,
                               p.fldProjectName,
                               p.fldClientId,
                               p.fldProjectDescription,
                               p.fldLocation,
                               p.fldManager,
                               p.fldIsClosed,
                               fldStartDate = LinqHelper.TruncateTime(p.fldStartDate),
                               fldEndDate = LinqHelper.TruncateTime(p.fldEndDate)
                           };

            List<ProjectClone> projects = new List<ProjectClone>();

            foreach (var proj in ProjectList)
            {
                ProjectClone clone = new ProjectClone();

                clone.fldProjectId = proj.fldProjectId;
                clone.fldProjectName = proj.fldProjectName;
                clone.fldClientId = proj.fldClientId;
                clone.fldProjectDescription = proj.fldProjectDescription;
                clone.fldLocation = proj.fldLocation;
                clone.fldManager = proj.fldManager;
                clone.fldIsClosed = proj.fldIsClosed;
                clone.fldStartDate = proj.fldStartDate;
                clone.fldEndDate = proj.fldEndDate;

                clone.TaskClockedStatus =   ClockStatus(clone.fldProjectId);

                projects.Add(clone);
            }

            if (payperiod == PayPeriodEnum.Today.ToString())
            {
                DateTime Today = DateTime.Today.ToAustralianDateTime();
                return projects.Where(p => p.fldStartDate == LinqHelper.TruncateTime(Today));
            }
            else if (payperiod == PayPeriodEnum.This_Week.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Today.ToAustralianDateTime().DayOfWeek));
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays(6 - ((int)DateTime.Today.ToAustralianDateTime().DayOfWeek));

                return projects.Where(p => p.fldStartDate >= LinqHelper.TruncateTime(startDate.Date) &&
                    p.fldStartDate <= LinqHelper.TruncateTime(endDate.Date));

            }
            else if (payperiod == PayPeriodEnum.This_Month.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Now.ToAustralianDateTime().Day));
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays((int)DateTime.DaysInMonth(DateTime.Now.ToAustralianDateTime().Year, DateTime.Now.ToAustralianDateTime().Month) - ((int)DateTime.Now.ToAustralianDateTime().Day));

                return projects.Where(p => p.fldStartDate >= LinqHelper.TruncateTime(startDate.Date) && p.fldStartDate <= LinqHelper.TruncateTime(endDate.Date));
            }
            else if (payperiod == PayPeriodEnum.Yesterday.ToString())
            {
                DateTime today = DateTime.Today.ToAustralianDateTime().AddDays(-1);
                return projects.Where(p => p.fldStartDate == LinqHelper.TruncateTime(today));
            }
            else if (payperiod == PayPeriodEnum.Last_Week.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Today.ToAustralianDateTime().DayOfWeek)).AddDays(-7);
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays(6 - ((int)DateTime.Today.ToAustralianDateTime().DayOfWeek)).AddDays(-7);

                return projects.Where(p => p.fldStartDate >= LinqHelper.TruncateTime(startDate.Date) && p.fldStartDate <= LinqHelper.TruncateTime(endDate.Date));
            }
            else if (payperiod == PayPeriodEnum.Last_Month.ToString())
            {
                DateTime startDate = DateTime.Today.AddDays(-(int)DateTime.Now.ToAustralianDateTime().Day + 1).AddDays(-DateTime.DaysInMonth((int)DateTime.Now.ToAustralianDateTime().Year, DateTime.Now.ToAustralianDateTime().AddMonths(-1).Month));
                DateTime endDate = startDate.AddMonths(1).AddDays(-1);

                return projects.Where(p => p.fldStartDate >= LinqHelper.TruncateTime(startDate.Date) && p.fldStartDate <= LinqHelper.TruncateTime(endDate.Date));
            }
            else
            {
                return projects;
            }
        }

        private string ClockStatus(int projectId)
        {
            DateTime Now = DateTime.Now.ToAustralianDateTime();

            var records = from p in db.Projects
                          join t in db.Tasks on p.fldProjectId equals t.fldProjectId
                          join e in db.Entries on t.fldTaskId equals e.fldTaskId
                          where p.fldProjectId == projectId && e.fldClockOut == null && e.fldClockIn <= Now
                          select new { p.fldProjectId };

            if (records.Count() > 0)
            {
                return "(ON THE CLOCK)";
            }

            return string.Empty;
        }

        // GET api/Project
        public object GetProjects()
        {
            var projects = from p in db.Projects
                           select new
                           {
                               p.fldProjectId,
                               p.fldProjectName,
                               p.fldClientId,
                               p.fldProjectDescription,
                               p.fldLocation,
                               p.fldManager,
                               p.fldIsClosed,
                               fldStartDate = LinqHelper.TruncateTime(p.fldStartDate),
                               fldEndDate = LinqHelper.TruncateTime(p.fldEndDate)
                           };
            return projects;
        }

        // GET api/Project/5
        [ResponseType(typeof(Project))]
        public dynamic GetProject(int id)
        {

            var tasks = from e in db.Entries
                        join t in db.Tasks on e.fldTaskId equals t.fldTaskId
                        join p in db.Projects on t.fldProjectId equals p.fldProjectId
                        where p.fldProjectId == id
                        select new
                        {
                            e.fldHours,
                            e.fldEarning,
                            p.Client.fldClientName
                        };

            double th = 0;
            decimal te = 0;
            if (tasks.Count() > 0)
            {
                th = Math.Round(tasks.Sum(tp => tp.fldHours).Value, 2);
                te = Math.Round(tasks.Sum(tp => tp.fldEarning).Value, 2);
            }



            var project = (from p in db.Projects
                           where p.fldProjectId == id
                           select new
                           {
                               p.fldProjectId,
                               p.fldProjectName,
                               p.fldClientId,
                               p.fldProjectDescription,
                               p.fldLocation,
                               p.fldManager,
                               p.fldIsClosed,
                               fldStartDate = LinqHelper.TruncateTime(p.fldStartDate),
                               fldEndDate = LinqHelper.TruncateTime(p.fldEndDate),
                               totalhours = th,
                               totalearning = te,
                               clientname = p.Client.fldClientName
                           }).FirstOrDefault();

            if (project == null)
            {
                return NotFound();
            }

            return project;
        }

        // PUT api/Project/5
        public IHttpActionResult PutProject(int id, Project project)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != project.fldProjectId)
            {
                return BadRequest();
            }

            Project dbProject = db.Projects.Find(id);
            dbProject.fldProjectName = project.fldProjectName;
            dbProject.fldClientId = project.fldClientId;
            dbProject.fldProjectDescription = project.fldProjectDescription;
            dbProject.fldLocation = project.fldLocation;
            dbProject.fldManager = project.fldManager;
            dbProject.fldIsClosed = project.fldIsClosed;
            dbProject.fldStartDate = project.fldStartDate;
            //dbProject.fldEndDate = project.fldEndDate;

            if (project.fldIsClosed == true && project.fldEndDate == null)
            {
                dbProject.fldEndDate = DateTime.Now.ToAustralianDateTime().Date;

                var tasks = db.Tasks.Where(t => t.fldProjectId == project.fldProjectId);

                foreach (Task task in tasks)
                {
                    task.fldIsDone = true;
                    task.fldEndDate = DateTime.Now.ToAustralianDateTime().Date;
                    db.Entry(task).State = EntityState.Modified;
                    db.SaveChanges();
                }
            }

            db.Entry(dbProject).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST api/Project
        [ResponseType(typeof(Project))]
        public IHttpActionResult PostProject(Project project)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (project.fldIsClosed == true && project.fldEndDate == null)
            {
                project.fldEndDate = DateTime.Now.ToAustralianDateTime().Date;

                var tasks = db.Tasks.Where(t => t.fldProjectId == project.fldProjectId);

                foreach (Task task in tasks)
                {
                    task.fldIsDone = true;
                    task.fldEndDate = DateTime.Now.ToAustralianDateTime().Date;
                    db.Entry(task).State = EntityState.Modified;
                    db.SaveChanges();
                }
            }

            db.Projects.Add(project);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return CreatedAtRoute("DefaultApi", new { id = project.fldProjectId }, project);
        }

        // DELETE api/Project/5
        [ResponseType(typeof(Project))]
        public IHttpActionResult DeleteProject(int id)
        {
            Project project = db.Projects.Find(id);

            var tasks = db.Tasks.Where(t => t.fldProjectId == id);
            var tasktags = db.TaskTags.Where(tg => tasks.Contains(tg.Task));
            var taskentries = db.Entries.Where(e => tasks.Contains(e.Task));

            db.Entries.RemoveRange(taskentries);
            db.TaskTags.RemoveRange(tasktags);
            db.Tasks.RemoveRange(tasks);
            db.Projects.Remove(project);

            if (project == null)
            {
                return NotFound();
            }

            db.SaveChanges();

            return Ok(project);
        }

        // DELETE api/Project/5
        [Route("~/api/DeleteMultipleProjects/{id:int}")]
        public dynamic PostProject(int id, dynamic projectlist)
        {
            TTProject[] projects = JsonConvert.DeserializeObject<TTProject[]>(projectlist.ToString());

            foreach (TTProject product in projects)
            {
                if (product.fldProjectId != 0)
                    DeleteProject(Convert.ToInt32(product.fldProjectId));
            }

            if (projects.Length > 0)
            {
                var project = projects.Where(p => p.fldProjectId != 0).FirstOrDefault();
                return GetProjectsByPayPeriod(project.fldPayPeriod, project.fldUserEmail);
            }

            return null;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ProjectExists(int id)
        {
            return db.Projects.Count(e => e.fldProjectId == id) > 0;
        }
    }

    public class TTProject
    {
        [JsonProperty("fldProjectId")]
        public int fldProjectId { get; set; }
        public string fldUserEmail { get; set; }
        public string fldPayPeriod { get; set; }
    }

    public class ProjectClone
    {
        public int fldProjectId;
        public string fldProjectName { get; set; }
        public int fldClientId { get; set; }
        public string fldProjectDescription { get; set; }
        public string fldLocation { get; set; }
        public string fldManager { get; set; }
        public bool fldIsClosed { get; set; }
        public DateTime? fldStartDate { get; set; }
        public DateTime? fldEndDate { get; set; }

        public string TaskClockedStatus;
    }
}