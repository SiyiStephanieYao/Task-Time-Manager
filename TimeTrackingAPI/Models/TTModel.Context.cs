﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class TimeTrackingEntities : DbContext
    {
        public TimeTrackingEntities()
            : base("name=TimeTrackingEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Client> Clients { get; set; }
        public virtual DbSet<PayPeriod> PayPeriods { get; set; }
        public virtual DbSet<Tag> Tags { get; set; }
        public virtual DbSet<TaskTag> TaskTags { get; set; }
        public virtual DbSet<TTUser> TTUsers { get; set; }
        public virtual DbSet<Project> Projects { get; set; }
        public virtual DbSet<TagFilter> TagFilters { get; set; }
        public virtual DbSet<Entry> Entries { get; set; }
        public virtual DbSet<Schedule> Schedules { get; set; }
        public virtual DbSet<Task> Tasks { get; set; }
    }
}
