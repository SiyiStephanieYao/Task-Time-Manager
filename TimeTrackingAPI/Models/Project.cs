//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace TimeTrackingAPI.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Project
    {
        public Project()
        {
            this.Tasks = new HashSet<Task>();
        }
    
        public int fldProjectId { get; set; }
        public string fldProjectName { get; set; }
        public int fldClientId { get; set; }
        public string fldProjectDescription { get; set; }
        public string fldLocation { get; set; }
        public string fldManager { get; set; }
        public bool fldIsClosed { get; set; }
        public Nullable<System.DateTime> fldStartDate { get; set; }
        public Nullable<System.DateTime> fldEndDate { get; set; }
        public string fldUserEmail { get; set; }
    
        public virtual Client Client { get; set; }
        public virtual TTUser TTUser { get; set; }
        public virtual ICollection<Task> Tasks { get; set; }
    }
}
