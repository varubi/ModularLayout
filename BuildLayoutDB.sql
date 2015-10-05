select @@servername + '\' + @@servicename
create database LayoutEditor
go 
use LayoutEditor
go

DROP TABLE
     dm_sections

GO

CREATE TABLE dm_sections(
	   ukey int IDENTITY(1, 1)
	 , page varchar(200)
	 , name varchar(200)
	 , updateOn varchar(200)
)

DROP TABLE
     dm_partials

GO

CREATE TABLE dm_partials(
	   ukey int IDENTITY(1, 1)
	 , name varchar(200)
	 , defaults varchar(2000)
	 , updateOn varchar(200)
)

DROP TABLE
     pagelayout

GO

CREATE TABLE pageLayout(
	   ukey int IDENTITY(1, 1)
	 , page varchar(200)
	 , sort int
	 , type varchar(200)
	 , ukey_name int
	 , value varchar(2000)
)

GO

DROP PROCEDURE
     pr_returnPageLayout

GO

CREATE PROCEDURE pr_returnPageLayout(
       @page varchar(200))
AS

BEGIN

    SELECT
	 a.sort
         , a.type
         , CASE
	     WHEN b.ukey IS NOT NULL THEN b.name
	     WHEN c.ukey IS NOT NULL THEN c.name
	     ELSE ''
	 END name
         , a.value
		 , isnull(c.defaults, '') defaults
		 , CASE
	     WHEN b.ukey IS NOT NULL THEN b.updateOn
	     WHEN c.ukey IS NOT NULL THEN c.updateOn
	     ELSE ''
	 END updateOn
     FROM pageLayout a
	LEFT JOIN dm_sections b
	  ON a.ukey_name = b.ukey
	 AND a.type = 'section'
	 AND a.page = b.page
	LEFT JOIN dm_partials c
	  ON a.ukey_name = c.ukey
	 AND a.type = 'partial'
     WHERE a.page = @page
     ORDER BY
	    sort
END

GO

INSERT INTO dm_sections(
       page
     , name
	 , updateOn)
VALUES('default', 'section1', 'SEARCH_CHANGE'),
      ('default', 'section2', 'CONTACT_SUBMIT'),
      ('default', 'section3', 'SEARCH_CHANGE CONTACT_SUBMIT'),
      ('default', 'section4', '')

INSERT INTO dm_partials(
       name
	   , defaults
	   , updateOn)
VALUES('partial1', '', 'VEHICLE_CHANGE'),
      ('partial2', 'name=partial2&height=200', ''),
      ('partial3', 'width=2000', 'CART_UPDATE')
	  GO

drop procedure pr_updatePageLayout
go
create procedure pr_updatePageLayout(@page varchar(200), @type varchar(200), @name varchar(200), @value varchar(200))
as begin 
declare @ukey_name int
declare @sort int = (select count(*)+ 1 from pageLayout a where a.page = @page)
if(@type = 'section')
	set @ukey_name = (select top 1  ukey from dm_sections a where a.page = @page and a.name = @name)
if(@type = 'partial')
	set @ukey_name = (select top 1  ukey from dm_partials a where a.name = @name)
	
if ((@type <> 'section' or (@type = 'section' and (select count(*) from pageLayout where page = @page and ukey_name = @ukey_name)<> 1 )) and ((@type <> 'html' and isnull(@ukey_name, 0) <> 0) or(@type = 'html')))
INSERT INTO pageLayout(
       page
     , sort
     , type
     , ukey_name
     , value)
VALUES(@page, @sort, @type, @ukey_name, @value)

end

go



INSERT INTO pageLayout(
       page
     , sort
     , type
     , ukey_name
     , value)
VALUES('default', 1, 'section', 1, ''),
      ('default', 2, 'partial', 1, ''),
      ('default', 3, 'html', NULL, '<div style="background: red; color: #FFF">Raw HTML inserted </div>'),
      ('default', 4, 'partial', 2, ''),
      ('default', 5, 'html', NULL, '<div class="head" style="background:blue">The following sections are in a container</div><div style="background: red; color: #FFF">'),
      ('default', 6, 'section', 2, ''),
	  ('default', 7, 'section', 3, ''),
      ('default', 8, 'html', NULL, '</div>')
	  go

delete from pagelayout where page = 'default'
go
pr_updatePageLayout 'default', 'section', 'section1', ''
go
pr_updatePageLayout 'default', 'partial', 'partial1', ''
go
pr_updatePageLayout 'default', 'html', NULL, '<div style="background: red; color: #FFF">Raw HTML inserted </div>'
go
pr_updatePageLayout 'default', 'html', NULL, '<div class="head" style="background:blue">The following sections are in a container</div><div style="background: red; color: #FFF">'
go
pr_updatePageLayout 'default', 'section', 'section3', ''
go
pr_updatePageLayout 'default', 'section', 'section2', ''
go
pr_updatePageLayout 'default', 'html', NULL, '</div>'
go


pr_returnPageLayout 'default'

select distinct name from dm_sections where page = 'default'