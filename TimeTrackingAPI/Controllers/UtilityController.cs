using Newtonsoft.Json;
using System;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Web.Http;
using TimeTrackingAPI.Models;

namespace TimeTrackingAPI.Controllers
{
    public class UtilityController : ApiController
    {
        private TimeTrackingEntities db = new TimeTrackingEntities();

        [Route("~/api/GetCSVData/{id:int}")]
        public void PostUtility(int id, dynamic fields)
        {
            try
            {
                CSVStructure csvFields = JsonConvert.DeserializeObject<CSVStructure>(fields.ToString());

                StringBuilder query = new StringBuilder();

                bool anyFieldSelected = false;
                query.Append("SELECT Distinct ");

                if (csvFields.ProjectNameChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldProjectName AS [Project Name], ");
                }

                if (csvFields.ProjectClientChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldClientName AS [Client Name], ");
                }

                if (csvFields.ProjectLocationChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldLocation AS [Project Location], ");
                }

                if (csvFields.ProjectDescriptionChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldProjectDescription AS [Project Description], ");
                }

                if (csvFields.ProjectStatusChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldIsClosed AS [Is Closed], ");
                }

                if (csvFields.TaskNameChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldTaskName  AS [Task Name], ");
                }

                if (csvFields.TaskEstimatedTimeChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldEstimagedHours AS [Estimated Hours], ");
                }

                if (csvFields.TaskLocationChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldTaskLocation AS [Task Location], ");
                }

                if (csvFields.TaskDescriptionChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldTaskDescription AS [Task Description], ");
                }

                if (csvFields.TaskHourlyRateChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldHourlyRate AS [Hourly Rate], ");
                }

                if (csvFields.TaskPayPeriodChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldPayPeriodName AS [Pay Period], ");
                }

                if (csvFields.TaskTagsChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldTagName AS [Tag], ");
                }
                if (csvFields.EntryNameChecked == true)
                {
                    anyFieldSelected = true;
                    query.Append(" fldClockIn AS [Clock In], fldClockOut AS [Clock Out], fldHours AS [Entry Hours],  fldEarning AS [Entry Earning], ");
                }

                if (anyFieldSelected == false)
                {
                    query.Clear();
                    query.Append("SELECT fldProjectName AS [Project Name],fldClientName AS [Client Name],fldLocation AS [Project Location],fldProjectDescription AS [Project Description],fldIsClosed AS [Is Closed],fldTaskName  AS [Task Name],fldEstimagedHours  AS [Estimated Hours],fldTaskLocation AS [Task Location],fldTaskDescription AS [Task Description]," +
                            "fldHourlyRate AS [Hourly Rate],fldPayPeriodName AS [Pay Period],fldTagName AS [Tag],fldClockIn AS [Clock In], fldClockOut AS [Clock Out], fldHours AS [Entry Hours],  fldEarning AS [Entry Earning], ");
                }

                query.Remove(query.ToString().LastIndexOf(","), 1);

                query.Append(" FROM Project	LEFT JOIN Task ON Project.fldProjectId = Task.fldProjectId	LEFT JOIN Client ON Project.fldClientId = Client.fldClientId " +
                             " LEFT JOIN TaskTag ON Task.fldTaskId = TaskTag.fldTaskId " +
                             " LEFT JOIN Tag ON TaskTag.fldTagId = Tag.fldTagId " +
                             " LEFT JOIN PayPeriod ON Task.fldPayPeriodId = PayPeriod.fldPayPeriodId" +
                             " LEFT JOIN Entry ON Entry.fldTaskId = Task.fldTaskId");

                RequiredFields rf = JsonConvert.DeserializeObject<RequiredFields>(csvFields.RequiredFields);

                string selectedIds = rf.Ids.Substring(0, rf.Ids.Length - 1);

                string whereClause = "";

                if (selectedIds.Length > 0) //Any Ids entered
                {
                    if (rf.type == "Project")
                    {
                        whereClause = " WHERE Project.fldProjectId  in (" + selectedIds + ")";
                    }
                    else if (rf.type == "Task")
                    {
                        whereClause = " WHERE Task.fldTaskId  in (" + selectedIds + ")";
                    }
                    else if (rf.type == "Entry")
                    {
                        whereClause = " WHERE Entry.fldEntryId in (" + selectedIds + ")";
                    }
                }

                if (whereClause != "")
                {
                    query.Append(whereClause);
                }

                SqlDataAdapter adpt = new SqlDataAdapter(query.ToString(), db.Database.Connection.ConnectionString);
                DataSet ds = new DataSet();
                adpt.Fill(ds);

                var bytes = Encoding.GetEncoding("UTF-8").GetBytes(ToCSV(ds.Tables[0]));
                MemoryStream memStream = new MemoryStream(bytes);

                var mailMsg = new MailMessage("mehul.brahmvar@gmail.com", csvFields.UserEmail, csvFields.Subject, "CSV File generated by Time tracking application");

                memStream.Position = 0;

                Attachment attachment = new Attachment(memStream, new ContentType("text/csv"));
                attachment.Name = DateTime.Now.ToAustralianDateTime().ToShortDateString() + ".csv";
                mailMsg.Attachments.Add(attachment);

                var smtp = new SmtpClient();
                smtp.Send(mailMsg);
            }
            catch
            {
                throw;
            }
        }

        [Route("~/api/GetFullCSVData")]
        public void PostUtility(dynamic fields)
        {
            try
            {
                CSVStructure csvFields = JsonConvert.DeserializeObject<CSVStructure>(fields.ToString());


                StringBuilder query = new StringBuilder();
                query.Clear();
                query.Append("SELECT fldProjectName AS [Project Name],fldClientName AS [Client Name],fldLocation AS [Project Location],fldProjectDescription AS [Project Description],fldIsClosed AS [Is Closed],fldTaskName  AS [Task Name],fldEstimagedHours  AS [Estimated Hours],fldTaskLocation AS [Task Location],fldTaskDescription AS [Task Description]," +
                        "fldHourlyRate AS [Hourly Rate],fldPayPeriodName AS [Pay Period],fldTagName AS [Tag],fldClockIn AS [Clock In], fldClockOut AS [Clock Out], fldHours AS [Entry Hours],  fldEarning AS [Entry Earning], ");

                query.Remove(query.ToString().LastIndexOf(","), 1);

                query.Append(" FROM Project	LEFT JOIN Task ON Project.fldProjectId = Task.fldProjectId	LEFT JOIN Client ON Project.fldClientId = Client.fldClientId " +
                             " LEFT JOIN TaskTag ON Task.fldTaskId = TaskTag.fldTaskId " +
                             " LEFT JOIN Tag ON TaskTag.fldTagId = Tag.fldTagId " +
                             " LEFT JOIN PayPeriod ON Task.fldPayPeriodId = PayPeriod.fldPayPeriodId" +
                             " LEFT JOIN Entry ON Entry.fldTaskId = Task.fldTaskId");

                RequiredFields rf = JsonConvert.DeserializeObject<RequiredFields>(csvFields.RequiredFields);

                string selectedIds = rf.Ids.Substring(0, rf.Ids.Length - 1);

                string whereClause = "";

                if (selectedIds.Length > 0) //Any Ids entered
                {
                    if (rf.type == "Project")
                    {
                        whereClause = " WHERE Project.fldProjectId  in (" + selectedIds + ")";
                    }
                    else if (rf.type == "Task")
                    {
                        whereClause = " WHERE Task.fldTaskId  in (" + selectedIds + ")";
                    }
                    else if (rf.type == "Entry")
                    {
                        whereClause = " WHERE Entry.fldEntryId in (" + selectedIds + ")";
                    }
                }

                if (whereClause != "")
                {
                    query.Append(whereClause);
                }

                SqlDataAdapter adpt = new SqlDataAdapter(query.ToString(), db.Database.Connection.ConnectionString);
                DataSet ds = new DataSet();
                adpt.Fill(ds);

                var bytes = Encoding.GetEncoding("UTF-8").GetBytes(ToCSV(ds.Tables[0]));
                MemoryStream memStream = new MemoryStream(bytes);

                var mailMsg = new MailMessage("mehul.brahmvar@gmail.com", csvFields.UserEmail, csvFields.Subject, "CSV File generated by Time tracking application");

                memStream.Position = 0;

                Attachment attachment = new Attachment(memStream, new ContentType("text/csv"));
                attachment.Name = DateTime.Now.ToAustralianDateTime().ToShortDateString() + ".csv";
                mailMsg.Attachments.Add(attachment);

                var smtp = new SmtpClient();
                smtp.Send(mailMsg);
            }
            catch
            {
                throw;
            }
        }

        public string ToCSV(DataTable table)
        {
            var result = new StringBuilder();
            for (int i = 0; i < table.Columns.Count; i++)
            {
                result.Append(table.Columns[i].ColumnName);
                result.Append(i == table.Columns.Count - 1 ? "\n" : ",");
            }

            foreach (DataRow row in table.Rows)
            {
                for (int i = 0; i < table.Columns.Count; i++)
                {
                    result.Append(row[i].ToString().Replace(',', ';'));
                    result.Append(i == table.Columns.Count - 1 ? "\n" : ",");
                }
            }

            return result.ToString();
        }

    }

    public class CSVStructure
    {
        public bool ProjectNameChecked { get; set; }
        public bool ProjectStartTimeChecked { get; set; }
        public bool ProjectClientChecked { get; set; }
        public bool ProjectEndTimeChecked { get; set; }
        public bool ProjectLocationChecked { get; set; }
        public bool ProjectDurationChecked { get; set; }
        public bool ProjectDescriptionChecked { get; set; }
        public bool ProjectTimeSuspendedChecked { get; set; }
        public bool ProjectEarningsChecked { get; set; }
        public bool TaskNameChecked { get; set; }
        public bool TaskStartTimeChecked { get; set; }
        public bool TaskEstimatedTimeChecked { get; set; }
        public bool TaskEndTimeChecked { get; set; }
        public bool TaskLocationChecked { get; set; }
        public bool TaskDurationChecked { get; set; }
        public bool TaskDescriptionChecked { get; set; }
        public bool TaskTimeSuspendedChecked { get; set; }
        public bool TaskStatusChecked { get; set; }
        public bool TaskHourlyRateChecked { get; set; }
        public bool TaskPayPeriodChecked { get; set; }
        public bool TaskEarningsChecked { get; set; }
        public bool TaskTagsChecked { get; set; }
        public bool ProjectStatusChecked { get; set; }
        public bool TaskIsPaidChecked { get; set; }
        public bool EntryNameChecked { get; set; }
        public string UserEmail { get; set; }
        public string Subject { get; set; }

        public dynamic RequiredFields;
    }

    public class RequiredFields
    {
        public string Ids { get; set; }
        public string type { get; set; }
    }
}