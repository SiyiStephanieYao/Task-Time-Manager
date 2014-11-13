CREATE TABLE [dbo].[TaskTag] (
    [fldTaskId] INT NOT NULL,
    [fldTagId]  INT NOT NULL,
    [Id]        INT IDENTITY (1, 1) NOT NULL,
    CONSTRAINT [PK_TaskTag_1] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskTag_Tag] FOREIGN KEY ([fldTagId]) REFERENCES [dbo].[Tag] ([fldTagId]),
    CONSTRAINT [FK_TaskTag_Task] FOREIGN KEY ([fldTaskId]) REFERENCES [dbo].[Task] ([fldTaskId]) ON DELETE CASCADE
);





