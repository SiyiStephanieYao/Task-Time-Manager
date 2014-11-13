CREATE TABLE [dbo].[Client] (
    [fldClientId]   INT           IDENTITY (1, 1) NOT NULL,
    [fldClientName] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_tblClient] PRIMARY KEY CLUSTERED ([fldClientId] ASC)
);

