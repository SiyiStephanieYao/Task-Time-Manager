CREATE TABLE [dbo].[PayPeriod] (
    [fldPayPeriodId]   INT           IDENTITY (1, 1) NOT NULL,
    [fldPayPeriodName] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_PayPeriod] PRIMARY KEY CLUSTERED ([fldPayPeriodId] ASC)
);

