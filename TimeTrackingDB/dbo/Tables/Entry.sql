CREATE TABLE [dbo].[Entry] (
    [fldEntryId]  INT             IDENTITY (1, 1) NOT NULL,
    [fldTaskId]   INT             NOT NULL,
    [fldClockIn]  DATETIME        NOT NULL,
    [fldClockOut] DATETIME        NULL,
    [fldUserId]   NVARCHAR (50)   NOT NULL,
    [fldHours]    FLOAT (53)      NULL,
    [fldEarning]  DECIMAL (18, 2) NULL,
    CONSTRAINT [PK_Entry] PRIMARY KEY CLUSTERED ([fldEntryId] ASC),
    CONSTRAINT [FK_Entry_Task] FOREIGN KEY ([fldTaskId]) REFERENCES [dbo].[Task] ([fldTaskId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Entry_TTUser] FOREIGN KEY ([fldUserId]) REFERENCES [dbo].[TTUser] ([fldUserEmail])
);







