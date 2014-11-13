CREATE TABLE [dbo].[TTUser] (
    [fldUserEmail]  NVARCHAR (50) NOT NULL,
    [fldPassword]   NVARCHAR (50) NOT NULL,
    [fldFirstName]  NVARCHAR (20) NOT NULL,
    [fldFamilyName] NVARCHAR (20) NOT NULL,
    [fldDOB]        DATE          NULL,
    [fldPosition]   NVARCHAR (20) NOT NULL,
    [fldMobile]     VARCHAR (20)  NOT NULL,
    [fldphoto]      VARCHAR (MAX) NULL,
    [fldIsActive]   BIT           NULL,
    CONSTRAINT [PK_tblUser] PRIMARY KEY CLUSTERED ([fldUserEmail] ASC)
);

