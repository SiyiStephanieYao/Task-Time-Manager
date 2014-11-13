using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using TimeTrackingAPI.Models;

namespace TimeTrackingAPI.Controllers
{
    public class GUIDClass
    {
        public Guid fldFilterId { get; set; }
    }

    public class LoginController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        // POST api/Login
        [ResponseType(typeof(TTUser))]
        public TTUser PostTTUser(Credentials credentials)
        {
            return db.TTUsers.Where(u => u.fldUserEmail == credentials.fldUserEmail && u.fldPassword == credentials.fldPassword && u.fldIsActive == true).FirstOrDefault<TTUser>();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        [Route("~/api/GetTaskByFilter/{id:int}")]
        public List<TaskClone> PostTTUser(int id, dynamic filters)
        {
            List<TaskClone> taskList = new List<TaskClone>();

            if (filters != null)
            {
                GUIDClass[] tagFilters = JsonConvert.DeserializeObject<GUIDClass[]>(filters.ToString());

                Guid[] array = new Guid[tagFilters.Length];

                int i = 0;
                foreach (GUIDClass filter in tagFilters)
                {
                    array[i] = filter.fldFilterId;
                    i++;
                }

                var tasks = from task in db.Tasks
                            join tasktags in db.TaskTags on task.fldTaskId equals tasktags.fldTaskId
                            join tagfilter in db.TagFilters on tasktags.fldTagId equals tagfilter.fldTagId
                            where task.fldProjectId == id && array.Contains(tagfilter.fldFilterId) && tagfilter.fldTagFilterType=="I"
                            select task;

                foreach (var t in tasks)
                {
                    if (taskList.Where(tt => tt.fldTaskId == t.fldTaskId).Count() > 0)
                    {
                        continue;
                    }

                    TaskClone twt = new TaskClone();

                    twt.fldTaskId = t.fldTaskId;
                    twt.fldEstimagedHours = t.fldEstimagedHours;
                    twt.fldHourlyRate = t.fldHourlyRate;
                    twt.fldPayPeriodId = t.fldPayPeriodId;
                    twt.fldProjectId = t.fldProjectId;
                    twt.fldTaskDescription = t.fldTaskDescription;
                    twt.fldTaskLocation = t.fldTaskLocation;
                    twt.fldTaskName = t.fldTaskName;

                    TaskController ctrl = new TaskController();
                    twt.TaskClockedStatus = ctrl.ClockStatus(t.fldTaskId);

                    foreach (var tag in t.TaskTags)
                    {
                        twt.TaskTags.Add(new TagMin() { fldTagId = tag.fldTagId, fldTagName = tag.Tag.fldTagName, Id = tag.Id });
                    }

                    taskList.Add(twt);
                }
            }
            else
            {
                var tasks = from task in db.Tasks
                            where task.fldProjectId == id
                            select task;

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
                    TaskController ctrl = new TaskController();
                    twt.TaskClockedStatus = ctrl.ClockStatus(t.fldTaskId);

                    foreach (var tag in t.TaskTags)
                    {
                        twt.TaskTags.Add(new TagMin() { fldTagId = tag.fldTagId, fldTagName = tag.Tag.fldTagName, Id = tag.Id });
                    }

                    taskList.Add(twt);
                }
            }

            return taskList;
        }
    }

    public class Credentials
    {
        public string fldUserEmail { get; set; }
        public string fldPassword { get; set; }
    }
}