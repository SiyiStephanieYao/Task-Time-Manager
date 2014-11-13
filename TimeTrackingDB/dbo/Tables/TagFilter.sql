CREATE TABLE [dbo].[TagFilter] (
    [fldFilterId]      UNIQUEIDENTIFIER NOT NULL,
    [fldTagId]         INT              NOT NULL,
    [fldFilterName]    NVARCHAR (50)    NOT NULL,
    [fldTagFilterType] NCHAR (1)        NOT NULL,
    CONSTRAINT [PK_TagFilter] PRIMARY KEY CLUSTERED ([fldFilterId] ASC, [fldTagId] ASC),
    CONSTRAINT [FK_TagFilter_Tag] FOREIGN KEY ([fldTagId]) REFERENCES [dbo].[Tag] ([fldTagId])
);

