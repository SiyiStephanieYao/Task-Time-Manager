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
    public class TagController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        // GET api/Tag
        public dynamic GetTags()
        {
            var x = from tag in db.Tags
                    select new
                    {
                        tag.fldTagId,
                        tag.fldTagName
                    };

            return x;
        }

        // GET api/Tag/5
        [ResponseType(typeof(Tag))]
        public IHttpActionResult GetTag(int id)
        {
            Tag tag = db.Tags.Find(id);
            if (tag == null)
            {
                return NotFound();
            }

            return Ok(tag);
        }

        // PUT api/Tag/5
        public IHttpActionResult PutTag(int id, Tag tag)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != tag.fldTagId)
            {
                return BadRequest();
            }

            db.Entry(tag).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TagExists(id))
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

        // POST api/Tag
        public dynamic PostTag(Tag tag)
        {
            db.Tags.Add(tag);
            db.SaveChanges();

            return from t in db.Tags
                   select new
                   {
                       t.fldTagId,
                       t.fldTagName
                   };
        }

        // DELETE api/Tag/5
        public List<Tag> DeleteTag(int id)
        {
            Tag tag = db.Tags.Find(id);
           
            db.Tags.Remove(tag);
            db.SaveChanges();

            return db.Tags.ToList<Tag>();
        }


        // DELETE api/Tags/5
        [Route("~/api/DeleteMultipleTags/{id:int}")]
        public List<Tag> PostTag(int id, dynamic TagList)
        {
            Tag[] tags = JsonConvert.DeserializeObject<Tag[]>(TagList.ToString());

            foreach (Tag tag in tags)
            {
                if (tag.fldTagId != 0)
                    DeleteTag(Convert.ToInt32(tag.fldTagId));
            }

            return db.Tags.ToList<Tag>();
        }
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool TagExists(int id)
        {
            return db.Tags.Count(e => e.fldTagId == id) > 0;
        }
    }
}