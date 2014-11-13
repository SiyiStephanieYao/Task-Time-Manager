CREATE TABLE [dbo].[Schedule] (
    [fldScheduleId]    INT           IDENTITY (1, 1) NOT NULL,
    [fldClockInYear]   INT           NOT NULL,
    [fldClockInMonth]  INT           NOT NULL,
    [fldClockInDay]    INT           NOT NULL,
    [fldClockInTime]   TIME (7)      NOT NULL,
    [fldUserId]        NVARCHAR (50) NOT NULL,
    [fldClockOutYear]  INT           NOT NULL,
    [fldClockOutMonth] INT           NOT NULL,
    [fldClockOutDay]   INT           NOT NULL,
    [fldClockOutTime]  INT           NOT NULL,
    CONSTRAINT [PK_Schedule] PRIMARY KEY CLUSTERED ([fldScheduleId] ASC),
    CONSTRAINT [FK_Schedule_TTUser] FOREIGN KEY ([fldUserId]) REFERENCES [dbo].[TTUser] ([fldUserEmail])
);

