CREATE TABLE [dbo].[Project] (
    [fldProjectId]          INT            IDENTITY (1, 1) NOT NULL,
    [fldProjectName]        NVARCHAR (50)  NOT NULL,
    [fldClientId]           INT            NOT NULL,
    [fldProjectDescription] NVARCHAR (200) NULL,
    [fldLocation]           NVARCHAR (500) NULL,
    [fldManager]            NVARCHAR (50)  NOT NULL,
    [fldIsClosed]           BIT            NOT NULL,
    [fldStartDate]          DATE           NULL,
    [fldEndDate]            DATE           NULL,
    [fldUserEmail]          NVARCHAR (50)  NOT NULL,
    CONSTRAINT [PK_tblProject] PRIMARY KEY CLUSTERED ([fldProjectId] ASC),
    CONSTRAINT [FK_Project_TTUser] FOREIGN KEY ([fldUserEmail]) REFERENCES [dbo].[TTUser] ([fldUserEmail]),
    CONSTRAINT [FK_tblProject_tblClient] FOREIGN KEY ([fldClientId]) REFERENCES [dbo].[Client] ([fldClientId])
);







