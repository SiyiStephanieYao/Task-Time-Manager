using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using TimeTrackingAPI.Models;

namespace TimeTrackingAPI.Controllers
{
    public class TTUserController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();


        [Route("~/api/ActivateUser")]
        public HttpResponseMessage GetActivateUser(string userEmail)
        {
            TTUser user = db.TTUsers.Where(u => u.fldUserEmail == userEmail).FirstOrDefault();

            if (user != null)
            {
                user.fldIsActive = true;
            }

            db.Entry(user).State = EntityState.Modified;
            db.SaveChanges();

            var response = Request.CreateResponse(HttpStatusCode.Found);
            response.Headers.Location = new Uri(HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Authority) + HttpRuntime.AppDomainAppVirtualPath + "/RegistrationDone.html");
            return response;
        }

        // GET api/TTUser
        public IEnumerable GetTTUsers()
        {
            var users = (from u in db.TTUsers
                         where u.fldIsActive == true
                         select new
                         {
                             u.fldDOB,
                             u.fldFamilyName,
                             u.fldFirstName,
                             u.fldIsActive,
                             u.fldMobile,
                             u.fldPassword,
                             u.fldphoto,
                             u.fldPosition,
                             u.fldUserEmail
                         });

            return users.AsEnumerable();
        }

        // GET api/TTUser/5
        [ResponseType(typeof(TTUser))]
        public IHttpActionResult GetTTUser(string id)
        {
            TTUser ttuser = db.TTUsers.Where(u => u.fldUserEmail == id).FirstOrDefault<TTUser>();
            if (ttuser == null)
            {
                return NotFound();
            }

            return Ok(ttuser);
        }

        // PUT api/TTUser/5
        public IHttpActionResult PutTTUser(string id, TTUser ttuser)
        {
            TTUser user = db.TTUsers.Find(ttuser.fldUserEmail);

            user.fldDOB = ttuser.fldDOB;
            user.fldFamilyName = ttuser.fldFamilyName;
            user.fldFirstName = ttuser.fldFirstName;
            user.fldIsActive = ttuser.fldIsActive;
            user.fldMobile = ttuser.fldMobile;
            user.fldPassword = ttuser.fldPassword;
            user.fldphoto = ttuser.fldphoto;
            user.fldPosition = ttuser.fldPosition;

            db.Entry(user).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST api/TTUser
        [ResponseType(typeof(TTUser))]
        public IHttpActionResult PostTTUser(TTUser ttuser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ttuser.fldIsActive = true;
            db.TTUsers.Add(ttuser);

            try
            {
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.InnerException.Message);
            }

            return CreatedAtRoute("DefaultApi", new { id = ttuser.fldUserEmail }, ttuser);
        }

        // DELETE api/TTUser/5
        [ResponseType(typeof(TTUser))]
        public IHttpActionResult DeleteTTUser(string id)
        {
            TTUser ttuser = db.TTUsers.Find(id);
            if (ttuser == null)
            {
                return NotFound();
            }

            db.TTUsers.Remove(ttuser);
            db.SaveChanges();

            return Ok(ttuser);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        // GET api/TTUser/5
        [ResponseType(typeof(TTUser))]
        [Route("~/api/GetPassword")]
        public IHttpActionResult GetPassword(string id, string email)
        {
            TTUser ttuser = db.TTUsers.Where(u => u.fldUserEmail == email).FirstOrDefault<TTUser>();

            //TODO: Send email to user
            string body = "Below are your credentials. \n\n User Name : " + email + " \n Password : " + ttuser.fldPassword;

            var mailMsg = new MailMessage("mehul.brahmvar@gmail.com", ttuser.fldUserEmail, "Password recovery", body);

            var smtp = new SmtpClient();
            smtp.Send(mailMsg);

            if (ttuser == null)
            {
                throw new Exception("Invalid Email");
            }

            return Ok(ttuser);
        }


        private bool TTUserExists(string id)
        {
            return db.TTUsers.Count(e => e.fldUserEmail == id) > 0;
        }
    }
}