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
    public class PayPeriodController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        // GET api/PayPeriod
        public dynamic GetPayPeriods()
        {
            return from p in db.PayPeriods
                            select new
                            {
                                p.fldPayPeriodId,
                                p.fldPayPeriodName
                            };
        }

        // GET api/PayPeriod/5
        public dynamic GetPayPeriod(int id)
        {
            return from p in db.PayPeriods
                   where p.fldPayPeriodId == id
                   select new
                   {
                       p.fldPayPeriodId,
                       p.fldPayPeriodName
                   };
        }

        // PUT api/PayPeriod/5
        public IHttpActionResult PutPayPeriod(int id, PayPeriod payperiod)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != payperiod.fldPayPeriodId)
            {
                return BadRequest();
            }

            db.Entry(payperiod).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PayPeriodExists(id))
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

        // POST api/PayPeriod
        [ResponseType(typeof(PayPeriod))]
        public IHttpActionResult PostPayPeriod(PayPeriod payperiod)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.PayPeriods.Add(payperiod);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = payperiod.fldPayPeriodId }, payperiod);
        }

        // DELETE api/PayPeriod/5
        [ResponseType(typeof(PayPeriod))]
        public IHttpActionResult DeletePayPeriod(int id)
        {
            PayPeriod payperiod = db.PayPeriods.Find(id);
            if (payperiod == null)
            {
                return NotFound();
            }

            db.PayPeriods.Remove(payperiod);
            db.SaveChanges();

            return Ok(payperiod);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PayPeriodExists(int id)
        {
            return db.PayPeriods.Count(e => e.fldPayPeriodId == id) > 0;
        }
    }
}