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
    
    public partial class Client
    {
        public Client()
        {
            this.Projects = new HashSet<Project>();
        }
    
        public int fldClientId { get; set; }
        public string fldClientName { get; set; }
    
        public virtual ICollection<Project> Projects { get; set; }
    }
}
