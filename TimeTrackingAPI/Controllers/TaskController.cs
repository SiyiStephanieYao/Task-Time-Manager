using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using TimeTrackingAPI.Models;

namespace TimeTrackingAPI.Controllers
{
    public class TaskController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        // GET api/Task
        public dynamic GetTasks()
        {
            return from task in db.Tasks
                   select new
                   {
                       task.fldTaskId,
                       task.fldTaskLocation,
                       task.fldTaskName,
                       task.fldEstimagedHours,
                       task.fldHourlyRate,
                       task.fldPayPeriodId,
                       task.fldProjectId,
                       fldStartDate = DbFunctions.TruncateTime(task.fldStartDate),
                       fldEndDate = DbFunctions.TruncateTime(task.fldEndDate),
                       task.fldIsDone,
                       task.fldIsPaid,
                       task.fldAutoClock
                   };
        }

        // GET api/Task/5
        public dynamic GetTask(int id)
        {
            TaskClone twt = new TaskClone();

            var tasks = from task in db.Tasks
                        where task.fldTaskId == id
                        select task;

            double totalhours = 0;
            decimal totalearning = 0;

            if (db.Entries.Where(e => e.fldTaskId == id).Count() > 0)
            {
                totalhours = Math.Round(db.Entries.Where(i => i.fldTaskId == id).Sum(e => e.fldHours).Value, 2);
                totalearning = Math.Round(db.Entries.Where(i => i.fldTaskId == id).Sum(e => e.fldEarning).Value, 2);
            }


            foreach (var t in tasks)
            {
                twt.fldTaskId = t.fldTaskId;
                twt.fldEstimagedHours = t.fldEstimagedHours;
                twt.fldHourlyRate = t.fldHourlyRate;
                twt.fldPayPeriodId = t.fldPayPeriodId;
                twt.fldProjectId = t.fldProjectId;
                twt.fldTaskDescription = t.fldTaskDescription;
                twt.fldTaskLocation = t.fldTaskLocation;
                twt.fldTaskName = t.fldTaskName;
                twt.fldStartDate = t.fldStartDate;
                twt.fldEndDate = t.fldEndDate;
                twt.fldIsDone = t.fldIsDone;
                twt.fldIsPaid = t.fldIsPaid;
                twt.fldAutoClock = t.fldAutoClock;
                twt.TaskClockedStatus = ClockStatus(t.fldTaskId);
                
                foreach (var tag in t.TaskTags)
                {
                    twt.TaskTags.Add(new TagMin() { fldTagId = tag.fldTagId, fldTagName = tag.Tag.fldTagName, Id = tag.Id });
                }

                twt.totalhours = totalhours;
                twt.totalearning = totalearning;
            }

            return twt;
        }

        public string ClockStatus(int taskId)
        {
            DateTime Now = DateTime.Now.ToAustralianDateTime();

            if (db.Entries.Where(e => e.fldTaskId == taskId && e.fldClockOut == null && e.fldClockIn <= Now).Count() > 0)
            {
                return "(ON THE CLOCK)";
            }

            return string.Empty;
        }

        [Route("~/api/GetTaskByProjectId/{id:int}")]
        public List<TaskClone> GetTaskByProjectId(int id)
        {
            List<TaskClone> taskList = new List<TaskClone>();
            var tasks = db.Tasks.Where(k => k.fldProjectId == id);
            foreach (var t in tasks)
            {
                TaskClone twt = new TaskClone();

                twt.fldTaskId = t.fldTaskId;
                twt.fldEstimagedHours = t.fldEstimagedHours;
                twt.fldHourlyRate = t.fldHourlyRate;
                twt.fldPayPeriodId = t.fldPayPeriodId;
                twt.fldProjectId = t.fldProjectId;
                twt.fldTaskDescription = t.fldTaskDescription;
                twt.fldTaskLocation = t.fldTaskLocation;
                twt.fldTaskName = t.fldTaskName;
                twt.fldStartDate = DbFunctions.TruncateTime(t.fldStartDate);
                twt.fldEndDate = DbFunctions.TruncateTime(t.fldEndDate);
                twt.fldIsDone = t.fldIsDone;
                twt.fldIsPaid = t.fldIsPaid;
                twt.fldAutoClock = t.fldAutoClock;
                twt.TaskClockedStatus = ClockStatus(t.fldTaskId);


                foreach (var tag in t.TaskTags)
                {
                    twt.TaskTags.Add(new TagMin() { fldTagId = tag.fldTagId, fldTagName = tag.Tag.fldTagName, Id = tag.Id });
                }

                taskList.Add(twt);
            }

            return taskList;
        }

        [Route("~/api/GetTaskByPayPeriod/{id:int}")]
        public List<TaskClone> GetTaskByPayPeriod(int id, string payperiod)
        {
            List<TaskClone> taskList = new List<TaskClone>();
            var tasks = from task in db.Tasks
                        where task.fldProjectId == id
                        select task;

            if (payperiod == PayPeriodEnum.Today.ToString())
            {
                DateTime Today = DateTime.Today.ToAustralianDateTime();

                return ReturnTaskList(taskList, tasks.Where(p => p.fldStartDate == DbFunctions.TruncateTime(Today)));
            }
            else if (payperiod == PayPeriodEnum.This_Week.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Today.ToAustralianDateTime().DayOfWeek));
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays(6 - ((int)DateTime.Today.ToAustralianDateTime().DayOfWeek));

                return ReturnTaskList(taskList,
                     tasks.Where(p => p.fldStartDate >= DbFunctions.TruncateTime(startDate.Date) && p.fldStartDate <= DbFunctions.TruncateTime(endDate.Date)));
            }
            else if (payperiod == PayPeriodEnum.This_Month.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Now.ToAustralianDateTime().Day));
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays((int)DateTime.DaysInMonth(DateTime.Now.ToAustralianDateTime().Year, DateTime.Now.ToAustralianDateTime().Month) - ((int)DateTime.Now.ToAustralianDateTime().Day));

                return ReturnTaskList(taskList,
                        tasks.Where(p => p.fldStartDate >= DbFunctions.TruncateTime(startDate.Date) && p.fldStartDate <= DbFunctions.TruncateTime(endDate.Date)));
            }
            else if (payperiod == PayPeriodEnum.Yesterday.ToString())
            {
                DateTime today = DateTime.Today.ToAustralianDateTime().AddDays(-1);

                return ReturnTaskList(taskList,
                        tasks.Where(p => p.fldStartDate == DbFunctions.TruncateTime(today)));

            }
            else if (payperiod == PayPeriodEnum.Last_Week.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Today.ToAustralianDateTime().DayOfWeek)).AddDays(-7);
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays(6 - ((int)DateTime.Today.ToAustralianDateTime().DayOfWeek)).AddDays(-7);

                return ReturnTaskList(taskList,
                        tasks.Where(p => p.fldStartDate >= DbFunctions.TruncateTime(startDate.Date) && p.fldStartDate <= DbFunctions.TruncateTime(endDate.Date)));
            }
            else if (payperiod == PayPeriodEnum.Last_Month.ToString())
            {
                DateTime startDate = DateTime.Today.AddDays(-(int)DateTime.Now.ToAustralianDateTime().Day + 1).AddDays(-DateTime.DaysInMonth((int)DateTime.Now.ToAustralianDateTime().Year, DateTime.Now.ToAustralianDateTime().AddMonths(-1).Month));
                DateTime endDate = startDate.AddMonths(1).AddDays(-1);

                return ReturnTaskList(taskList,
                        tasks.Where(p => p.fldStartDate >= DbFunctions.TruncateTime(startDate.Date) && p.fldStartDate <= DbFunctions.TruncateTime(endDate.Date)));

            }
            else
            {
                return ReturnTaskList(taskList, tasks);
            }
        }

        private List<TaskClone> ReturnTaskList(List<TaskClone> taskList, IQueryable<Task> tasks)
        {
            foreach (var t in tasks)
            {
                TaskClone twt = new TaskClone();

                twt.fldTaskId = t.fldTaskId;
                twt.fldEstimagedHours = t.fldEstimagedHours;
                twt.fldHourlyRate = t.fldHourlyRate;
                twt.fldPayPeriodId = t.fldPayPeriodId;
                twt.fldProjectId = t.fldProjectId;
                twt.fldTaskDescription = t.fldTaskDescription;
                twt.fldTaskLocation = t.fldTaskLocation;
                twt.fldTaskName = t.fldTaskName;
                twt.fldStartDate = t.fldStartDate;
                twt.fldEndDate = t.fldEndDate;
                twt.fldIsDone = t.fldIsDone;
                twt.fldIsPaid = t.fldIsPaid;
                twt.fldAutoClock = t.fldAutoClock;

                twt.TaskClockedStatus = ClockStatus(t.fldTaskId);

                foreach (var tag in t.TaskTags)
                {
                    twt.TaskTags.Add(new TagMin() { fldTagId = tag.fldTagId, fldTagName = tag.Tag.fldTagName, Id = tag.Id });
                }

                taskList.Add(twt);
            }

            return taskList;
        }

        // PUT api/Task/5
        public IHttpActionResult PutTask(int id, Task task)
        {
            try
            {
                //Remove all existing tags
                var tags = from t in db.TaskTags
                           where t.fldTaskId == task.fldTaskId
                           select t;

                if (task.fldIsDone == true && task.fldEndDate == null)
                    task.fldEndDate = DateTime.Now.ToAustralianDateTime().Date;

                db.TaskTags.RemoveRange(tags);

                foreach (TaskTag t in task.TaskTags)
                {
                    t.fldTaskId = id;

                    if (db.Entry<TaskTag>(t).State == EntityState.Detached)
                    {
                        db.TaskTags.Add(t);
                        db.Entry(t).State = EntityState.Added;
                    }
                }

                if (db.Entry<Task>(task).State == EntityState.Detached)
                {
                    db.Tasks.Attach(task);
                    db.Entry(task).State = EntityState.Modified;
                }

                db.SaveChanges();
            }
            catch
            {
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST api/Task
        [ResponseType(typeof(Task))]
        public IHttpActionResult PostTask(Task task)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                if (task.fldIsDone == true && task.fldEndDate == null)
                    task.fldEndDate = DateTime.Now.ToAustralianDateTime().Date;

                db.Tasks.Add(task);


                db.SaveChanges();
            }
            catch
            {
                throw;
            }

            return CreatedAtRoute("DefaultApi", new { id = task.fldTaskId }, task);
        }

        // DELETE api/Task/5
        [ResponseType(typeof(Task))]
        public IHttpActionResult DeleteTask(int id)
        {
            Task task = db.Tasks.Find(id);
            if (task == null)
            {
                return NotFound();
            }

            var taskentries = db.Entries.Where(e => e.fldTaskId == id);
            db.Entries.RemoveRange(taskentries);

            var tasktags = db.TaskTags.Where(k => k.fldTaskId == id);
            db.TaskTags.RemoveRange(tasktags);

            db.Tasks.Remove(task);
            db.SaveChanges();

            return Ok(task);
        }

        // DELETE api/Project/5
        [Route("~/api/DeleteMultipleTasks/{id:int}")]
        public dynamic PostTask(int id, dynamic taskList)
        {
            TaskClone[] tasks = JsonConvert.DeserializeObject<TaskClone[]>(taskList.ToString());
            int projectId = id;

            foreach (TaskClone task in tasks)
            {
                if (task.fldTaskId != 0)
                    DeleteTask(Convert.ToInt32(task.fldTaskId));
            }

            if (tasks.Length > 0)
            {
                var task = tasks.Where(p => p.fldTaskId != 0 && p.fldProjectId != 0).FirstOrDefault();
                return GetTaskByPayPeriod(task.fldProjectId, task.fldPayPeriod);
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

        private bool TaskExists(int id)
        {
            return db.Tasks.Count(e => e.fldTaskId == id) > 0;
        }

        [Route("~/api/IsCheckOut")]
        public bool GetIsCheckOut(int id, int TaskId, string UserId)
        {
            DateTime Now = DateTime.Now.ToAustralianDateTime();

            if (db.Entries.Where(e => e.fldTaskId == TaskId && e.fldClockOut == null && e.fldClockIn <= Now).Count() > 0)
                return false;
            else
                return true;
        }
    }

    public class TaskClone
    {
        public TaskClone()
        {
            TaskTags = new List<TagMin>();
        }

        public int fldTaskId { get; set; }
        public string fldTaskName { get; set; }
        public string fldTaskDescription { get; set; }
        public string fldTaskLocation { get; set; }
        public Nullable<double> fldEstimagedHours { get; set; }
        public Nullable<double> fldHourlyRate { get; set; }
        public Nullable<int> fldPayPeriodId { get; set; }
        public int fldProjectId { get; set; }
        public Nullable<DateTime> fldStartDate { get; set; }
        public Nullable<DateTime> fldEndDate { get; set; }
        public bool? fldIsDone { get; set; }
        public bool? fldIsPaid { get; set; }
        public bool? fldAutoClock { get; set; }

        public double totalhours { get; set; }
        public decimal totalearning { get; set; }

        public List<TagMin> TaskTags { get; set; }
        public string fldPayPeriod { get; set; } //String value
        public string TaskClockedStatus { get; set; }
    }

    public class TagMin
    {
        public int fldTagId { get; set; }
        public string fldTagName { get; set; }
        public int Id { get; set; }
    }
}