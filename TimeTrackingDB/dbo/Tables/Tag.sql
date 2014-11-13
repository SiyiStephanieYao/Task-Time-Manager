CREATE TABLE [dbo].[Tag] (
    [fldTagId]   INT           IDENTITY (1, 1) NOT NULL,
    [fldTagName] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_Tag] PRIMARY KEY CLUSTERED ([fldTagId] ASC)
);

