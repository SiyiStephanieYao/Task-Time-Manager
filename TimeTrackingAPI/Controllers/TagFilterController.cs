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
    public class TagFilterController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        // GET api/TagFilter
        public dynamic GetTagFilters()
        {
            var filters = (from filter in db.TagFilters
                           select new
                           {
                               filter.fldFilterId,
                               filter.fldFilterName
                           }).Distinct();

            return filters;
        }

        // GET api/TagFilter/5
        [ResponseType(typeof(TagFilter))]
        public IHttpActionResult GetTagFilter(Guid id)
        {
            TagFilter tagfilter = db.TagFilters.Find(id);
            if (tagfilter == null)
            {
                return NotFound();
            }

            return Ok(tagfilter);
        }

        // PUT api/TagFilter/5
        public IHttpActionResult PutTagFilter(Guid id, TagFilter tagfilter)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != tagfilter.fldFilterId)
            {
                return BadRequest();
            }

            db.Entry(tagfilter).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TagFilterExists(id))
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

        // POST api/TagFilter
        [ResponseType(typeof(TagFilter))]
        public IHttpActionResult PostTagFilter(TagFilter tagfilter)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.TagFilters.Add(tagfilter);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (TagFilterExists(tagfilter.fldFilterId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = tagfilter.fldFilterId }, tagfilter);
        }

        // POST api/TagFilter
        [Route("~/api/AddTagFilter")]
        public void PostTagFilter(dynamic tagfilter)
        {
            ExtendedTagFilter tags = JsonConvert.DeserializeObject<ExtendedTagFilter>(tagfilter.ToString());

            //db.TagFilters.Add(tagfilter);

            Guid FilterID = Guid.NewGuid();


            if (tags.ExcludeTags != null)
            {
                foreach (ExtendedFilterTags eTag in tags.ExcludeTags)
                {
                    TagFilter filter = new TagFilter();
                    filter.fldFilterId = FilterID;
                    filter.fldFilterName = tags.fldFilterName;
                    filter.fldTagFilterType = "E";
                    filter.fldTagId = eTag.fldTagId;

                    db.TagFilters.Add(filter);
                }
            }

            if (tags.IncludeTags != null)
            {
                foreach (ExtendedFilterTags iTag in tags.IncludeTags)
                {
                    TagFilter filter = new TagFilter();
                    filter.fldFilterId = FilterID;
                    filter.fldFilterName = tags.fldFilterName;
                    filter.fldTagFilterType = "I";
                    filter.fldTagId = iTag.fldTagId;

                    db.TagFilters.Add(filter);
                }
            }

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                throw;
            }
        }


        // DELETE api/Project/5
        [Route("~/api/DeleteMultipleTagFilter/{id:int}")]
        public dynamic PostTagFilter(int id, dynamic filterList)
        {
            TagFilter[] tagFilters = JsonConvert.DeserializeObject<TagFilter[]>(filterList.ToString());

            foreach (TagFilter tagfilter in tagFilters)
            {
                if (tagfilter.fldFilterId != null)
                    DeleteTagFilter(tagfilter.fldFilterId);
            }

            var filters = (from filter in db.TagFilters
                           select new
                           {
                               filter.fldFilterId,
                               filter.fldFilterName
                           }).Distinct();

            return filters;
        }

        // DELETE api/TagFilter/5
        [ResponseType(typeof(TagFilter))]
        public IHttpActionResult DeleteTagFilter(Guid id)
        {
            List<TagFilter> tagfilter = db.TagFilters.Where(f => f.fldFilterId == id).ToList<TagFilter>();
            db.TagFilters.RemoveRange(tagfilter);
            db.SaveChanges();

            return Ok(tagfilter);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool TagFilterExists(Guid id)
        {
            return db.TagFilters.Count(e => e.fldFilterId == id) > 0;
        }
    }

    public class ExtendedTagFilter
    {
        public string fldFilterName { get; set; }
        public List<ExtendedFilterTags> IncludeTags;
        public List<ExtendedFilterTags> ExcludeTags;
    }

    public class ExtendedFilterTags
    {
        public int fldTagId { get; set; }
        public string fldTagName { get; set; }
        public string type { get; set; }
    }
}