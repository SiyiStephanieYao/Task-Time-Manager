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
    
    public partial class TagFilter
    {
        public System.Guid fldFilterId { get; set; }
        public int fldTagId { get; set; }
        public string fldFilterName { get; set; }
        public string fldTagFilterType { get; set; }
    
        public virtual Tag Tag { get; set; }
    }
}
