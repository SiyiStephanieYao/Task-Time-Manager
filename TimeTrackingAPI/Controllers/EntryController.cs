using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using TimeTrackingAPI.Models;

namespace TimeTrackingAPI.Controllers
{
    public static class DateTimeHelper
    {
        public static DateTime ToAustralianDateTime(this DateTime dt)
        {
            return TimeZoneInfo.ConvertTimeBySystemTimeZoneId(dt, "AUS Eastern Standard Time");
        }
    }   
    
    public class EntryController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        // GET api/Entry
        public IQueryable<Entry> GetEntries()
        {
            return db.Entries;
        }

        //// GET api/Entry/5
        //[ResponseType(typeof(Entry))]
        //public IHttpActionResult GetEntry(int id)
        //{
        //    Entry entry = db.Entries.Find(id);
        //    if (entry == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(entry);
        //}

        // GET api/Entry/5
        public ExtendedEntryViewModel GetEntry(int id)
        {
            var entries = (from e in db.Entries
                           where (e.fldTaskId == id && e.fldClockOut != null)
                           select new
                           {
                               e.fldClockIn,
                               e.fldClockOut,
                               e.fldEntryId,
                               e.fldTaskId,
                               e.fldUserId,
                               e.Task,
                               e.TTUser,
                               e.fldHours,
                               e.fldEarning
                           });

            var totalHours = entries.AsEnumerable().Sum(th => th.fldHours);
            var totalEarnings = entries.AsEnumerable().Sum(te => te.fldEarning);

            List<EntryViewModel> EntriesList = new List<EntryViewModel>();

            foreach (var e in entries)
            {
                EntryViewModel vm = new EntryViewModel();

                vm.fldClockIn = e.fldClockIn;
                vm.fldClockOut = e.fldClockOut;
                vm.fldEntryId = e.fldEntryId;
                vm.fldTaskId = e.fldTaskId;
                vm.fldUserId = e.fldUserId;
                vm.Task = e.Task;
                vm.TTUser = e.TTUser;
                vm.fldHours = (float)e.fldHours;
                vm.fldEarning = (decimal)e.fldEarning;

                EntriesList.Add(vm);
            }

            ExtendedEntryViewModel eev = new ExtendedEntryViewModel();
            eev.EntryViewModelList = EntriesList;
            eev.TotalHours = (float)totalHours;
            eev.TotalEarning = (decimal)totalEarnings;

            return eev;
        }

        // PUT api/Entry/5
        public IHttpActionResult PutEntry(int id, dynamic entrydata)
        {
            EntryData selectedEntry = JsonConvert.DeserializeObject<EntryData>(entrydata.ToString());
           
            DateTime selectedDate = DateTime.Now.ToAustralianDateTime();

            List<Entry> entryList = db.Entries.Where(e => e.fldTaskId == selectedEntry.TaskId && e.fldUserId == selectedEntry.UserId && e.fldClockOut == null && e.fldClockIn <= selectedDate).ToList<Entry>();

            foreach (Entry entry in entryList)
            {
                entry.fldClockOut = DateTime.Now.ToAustralianDateTime();
                entry.fldHours = Math.Round(entry.fldClockOut.Value.Subtract(entry.fldClockIn).TotalHours, 2);
                entry.fldEarning = Math.Round(Convert.ToDecimal(entry.Task.fldHourlyRate) * Convert.ToDecimal(entry.fldHours), 2);

                db.Entry(entryList.First()).State = EntityState.Modified;
                db.SaveChanges();
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST api/Entry
        [ResponseType(typeof(Entry))]
        public IHttpActionResult PostEntry(Entry entry)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Entries.Add(entry);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = entry.fldEntryId }, entry);
        }

        [Route("~/api/CreateClockInEntry")]
        public void PostEntry(dynamic entrydata)
        {
            EntryData selectedEntry = JsonConvert.DeserializeObject<EntryData>(entrydata.ToString());

            Entry entry = new Entry();
            entry.fldTaskId = selectedEntry.TaskId;
            entry.fldClockIn = DateTime.Now.ToAustralianDateTime();
            entry.fldUserId = selectedEntry.UserId;
            entry.fldHours = 0;
            entry.fldEarning = 0;

            db.Entries.Add(entry);
            db.SaveChanges();
        }

        [Route("~/api/AutoClockInEntry")]
        public void PostEntry(dynamic entrydata, string ClockInOut)
        {
            DateTime Now = DateTime.Now.ToAustralianDateTime();

            EntryData selectedEntry = JsonConvert.DeserializeObject<EntryData>(entrydata.ToString());

            //2014/10/31 18:54
            string yyyy = selectedEntry.ClockInOutTime.Substring(0, 4);
            string mm = selectedEntry.ClockInOutTime.Substring(5, 2);
            string dd = selectedEntry.ClockInOutTime.Substring(8, 2);

            string hh = selectedEntry.ClockInOutTime.Substring(11, 2);
            string min = selectedEntry.ClockInOutTime.Substring(14, 2);

            DateTime selectedDate = new DateTime(Convert.ToInt16(yyyy), Convert.ToInt16(mm), Convert.ToInt16(dd), Convert.ToInt16(hh), Convert.ToInt16(min), 0);

            if (ClockInOut == "Stop Clock At...") //update clockout time
            {
                List<Entry> entryList = db.Entries.Where(e => e.fldTaskId == selectedEntry.TaskId && e.fldUserId == selectedEntry.UserId && e.fldClockOut == null && e.fldClockIn <= Now).ToList<Entry>();

                foreach (Entry entry in entryList)
                {
                    entry.fldClockOut = selectedDate;
                    entry.fldHours = Math.Round(entry.fldClockOut.Value.Subtract(entry.fldClockIn).TotalHours, 2);
                    entry.fldEarning = Math.Round(Convert.ToDecimal(entry.Task.fldHourlyRate) * Convert.ToDecimal(entry.fldHours), 2);

                    db.Entry(entryList.First()).State = EntityState.Modified;
                }
            }
            else if (ClockInOut == "Start Clock At...") //create new entry
            {
                Entry entry = new Entry();
                entry.fldTaskId = selectedEntry.TaskId;
                entry.fldClockIn = selectedDate;
                entry.fldUserId = selectedEntry.UserId;
                entry.fldHours = 0;
                entry.fldEarning = 0;

                db.Entries.Add(entry);
            }

            db.SaveChanges();
        }

        private static ExtendedEntryViewModel ReturnEntryList(List<EntryClone> entryList, IQueryable<Entry> entries)
        {
            foreach (var entry in entries)
            {
                EntryClone twt = new EntryClone();

                twt.fldClockIn = entry.fldClockIn;
                twt.fldClockOut = entry.fldClockOut;
                twt.fldEarning = entry.fldEarning;
                twt.fldEntryId = entry.fldEntryId;
                twt.fldHours = entry.fldHours;
                twt.fldTaskId = entry.fldTaskId;
                twt.fldUserId = entry.fldUserId;

                entryList.Add(twt);
            }

            var totalHours = entries.AsEnumerable().Sum(th => th.fldHours);
            var totalEarnings = entries.AsEnumerable().Sum(te => te.fldEarning);

            List<EntryViewModel> EntriesList = new List<EntryViewModel>();

            foreach (var e in entries)
            {
                EntryViewModel vm = new EntryViewModel();

                vm.fldClockIn = e.fldClockIn;
                vm.fldClockOut = e.fldClockOut;
                vm.fldEntryId = e.fldEntryId;
                vm.fldTaskId = e.fldTaskId;
                vm.fldUserId = e.fldUserId;
                vm.Task = e.Task;
                vm.TTUser = e.TTUser;
                vm.fldHours = (float)e.fldHours;
                vm.fldEarning = (decimal)e.fldEarning;

                EntriesList.Add(vm);
            }

            ExtendedEntryViewModel eev = new ExtendedEntryViewModel();
            eev.EntryViewModelList = EntriesList;
            eev.TotalHours = (float)totalHours;
            eev.TotalEarning = (decimal)totalEarnings;

            return eev;
        }

        [Route("~/api/GetEntryByPayPeriod/{id:int}")]
        public ExtendedEntryViewModel GetEntryByPayPeriod(int id, string payperiod)
        {
            DateTime Today = DateTime.Today.ToAustralianDateTime();
            
            List<EntryClone> entryList = new List<EntryClone>();
            var entries = from entry in db.Entries
                          where entry.fldTaskId == id
                          select entry;

            if (payperiod == PayPeriodEnum.Today.ToString())
            {
                return ReturnEntryList(entryList, entries.Where(p => DbFunctions.TruncateTime(p.fldClockIn) == DbFunctions.TruncateTime(Today)));
            }
            else if (payperiod == PayPeriodEnum.This_Week.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Today.ToAustralianDateTime().DayOfWeek));
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays(6 - ((int)DateTime.Today.ToAustralianDateTime().DayOfWeek));

                return ReturnEntryList(entryList,
                     entries.Where(p => DbFunctions.TruncateTime(p.fldClockIn) >= DbFunctions.TruncateTime(startDate.Date) && DbFunctions.TruncateTime(p.fldClockIn) <= DbFunctions.TruncateTime(endDate.Date)));
            }
            else if (payperiod == PayPeriodEnum.This_Month.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Now.ToAustralianDateTime().Day));
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays((int)DateTime.DaysInMonth(DateTime.Now.ToAustralianDateTime().Year, DateTime.Now.ToAustralianDateTime().Month) - ((int)DateTime.Now.ToAustralianDateTime().Day));

                return ReturnEntryList(entryList,
                        entries.Where(p => DbFunctions.TruncateTime(p.fldClockIn) >= DbFunctions.TruncateTime(startDate.Date) && DbFunctions.TruncateTime(p.fldClockIn) <= DbFunctions.TruncateTime(endDate.Date)));
            }
            else if (payperiod == PayPeriodEnum.Yesterday.ToString())
            {
                DateTime today = DateTime.Today.ToAustralianDateTime().AddDays(-1);

                return ReturnEntryList(entryList,
                        entries.Where(p => DbFunctions.TruncateTime(p.fldClockIn) == DbFunctions.TruncateTime(today)));

            }
            else if (payperiod == PayPeriodEnum.Last_Week.ToString())
            {
                DateTime startDate = DateTime.Today.ToAustralianDateTime().AddDays(-((int)DateTime.Today.ToAustralianDateTime().DayOfWeek)).AddDays(-7);
                DateTime endDate = DateTime.Today.ToAustralianDateTime().AddDays(6 - ((int)DateTime.Today.ToAustralianDateTime().DayOfWeek)).AddDays(-7);

                return ReturnEntryList(entryList,
                        entries.Where(p => DbFunctions.TruncateTime(p.fldClockIn) >= DbFunctions.TruncateTime(startDate.Date) && DbFunctions.TruncateTime(p.fldClockIn) <= DbFunctions.TruncateTime(endDate.Date)));
            }
            else if (payperiod == PayPeriodEnum.Last_Month.ToString())
            {
                DateTime startDate = DateTime.Today.AddDays(-(int)DateTime.Now.ToAustralianDateTime().Day + 1).AddDays(-DateTime.DaysInMonth((int)DateTime.Now.ToAustralianDateTime().Year, DateTime.Now.ToAustralianDateTime().AddMonths(-1).Month));
                DateTime endDate = startDate.AddMonths(1).AddDays(-1);

                return ReturnEntryList(entryList,
                        entries.Where(p => DbFunctions.TruncateTime(p.fldClockIn) >= DbFunctions.TruncateTime(startDate.Date) && DbFunctions.TruncateTime(p.fldClockIn) <= DbFunctions.TruncateTime(endDate.Date)));
            }
            else
            {
                return ReturnEntryList(entryList, entries);
            }
        }

        // DELETE api/Entry/5
        [ResponseType(typeof(Entry))]
        public IHttpActionResult DeleteEntry(int id)
        {
            Entry entry = db.Entries.Find(id);
            if (entry == null)
            {
                return NotFound();
            }

            db.Entries.Remove(entry);
            db.SaveChanges();

            return Ok(entry);
        }

        // DELETE api/Project/5
        [Route("~/api/DeleteMultipleEntry/{id:int}")]
        public dynamic PostEntry(int id, dynamic entrylist)
        {
            EntryClone[] entrieList = JsonConvert.DeserializeObject<EntryClone[]>(entrylist.ToString());

            foreach (EntryClone entry in entrieList)
            {
                if (entry.fldEntryId != 0)
                    DeleteEntry(Convert.ToInt32(entry.fldEntryId));
            }

            if (entrieList.Length > 0)
            {
                var entry = entrieList.Where(p => p.fldEntryId != 0).FirstOrDefault();
                return GetEntryByPayPeriod(id, entry.fldPayPeriod);
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

        private bool EntryExists(int id)
        {
            return db.Entries.Count(e => e.fldEntryId == id) > 0;
        }
    }

    public class EntryData
    {
        public int TaskId { get; set; }
        public string UserId { get; set; }
        public string ClockInOutTime { get; set; }
    }

    public class EntryViewModel
    {
        public int fldEntryId { get; set; }
        public int fldTaskId { get; set; }
        public System.DateTime fldClockIn { get; set; }
        public Nullable<System.DateTime> fldClockOut { get; set; }
        public string fldUserId { get; set; }

        public virtual Task Task { get; set; }
        public virtual TTUser TTUser { get; set; }

        public float fldHours { get; set; }
        public decimal fldEarning { get; set; }
    }

    public class ExtendedEntryViewModel
    {
        public List<EntryViewModel> EntryViewModelList { get; set; }
        public float TotalHours { get; set; }
        public decimal TotalEarning { get; set; }
    }

    public class EntryClone
    {
        public int fldEntryId { get; set; }
        public int fldTaskId { get; set; }
        public System.DateTime fldClockIn { get; set; }
        public Nullable<System.DateTime> fldClockOut { get; set; }
        public string fldUserId { get; set; }
        public Nullable<double> fldHours { get; set; }
        public Nullable<decimal> fldEarning { get; set; }
        public string fldPayPeriod { get; set; }
    }
}