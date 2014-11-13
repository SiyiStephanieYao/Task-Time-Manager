CREATE TABLE [dbo].[Task] (
    [fldTaskId]          INT            IDENTITY (1, 1) NOT NULL,
    [fldTaskName]        NVARCHAR (100) NOT NULL,
    [fldTaskDescription] NVARCHAR (100) NULL,
    [fldTaskLocation]    NVARCHAR (500) NOT NULL,
    [fldEstimagedHours]  FLOAT (53)     NULL,
    [fldHourlyRate]      FLOAT (53)     NULL,
    [fldPayPeriodId]     INT            NULL,
    [fldProjectId]       INT            NOT NULL,
    [fldStartDate]       DATE           NULL,
    [fldEndDate]         DATE           NULL,
    [fldIsDone]          BIT            NULL,
    [fldIsPaid]          BIT            NULL,
    [fldAutoClock]       BIT            NULL,
    CONSTRAINT [PK_Task] PRIMARY KEY CLUSTERED ([fldTaskId] ASC),
    CONSTRAINT [FK_Task_PayPeriod] FOREIGN KEY ([fldPayPeriodId]) REFERENCES [dbo].[PayPeriod] ([fldPayPeriodId]),
    CONSTRAINT [FK_Task_Project] FOREIGN KEY ([fldProjectId]) REFERENCES [dbo].[Project] ([fldProjectId]) ON DELETE CASCADE
);













