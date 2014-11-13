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
    public class ChangePasswordController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        // POST api/ChangePassword
        [ResponseType(typeof(TTUser))]
        public bool PostChangePassword(PasswordDetails passwordDetails)
        {
            TTUser user = db.TTUsers.Where(u => u.fldUserEmail == passwordDetails.Email).FirstOrDefault<TTUser>();

            if (user.fldPassword != passwordDetails.OriginalPassword)
                throw new Exception("You have entered wrong password");

           try
            {
                user.fldPassword = passwordDetails.NewPassword;
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();

                return true;
            }
            catch (DbUpdateException)
            {
                throw;
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
     }

    public class PasswordDetails
    {
        public string OriginalPassword { get; set; }
        public string NewPassword { get; set; }
        public string Email { get; set; }
    }
}