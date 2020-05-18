---
layout: post
title: Redshift Materialized Views
tags: [redshift]
comments: true
hidden: false
author: agnieszka
image: /images/redshift-materialized-views/image1.jpg
---

It is often convenient to create a view upon your normalized schema to join and aggregate the data, especially when it requires a complicated query.

![publish](/images/redshift-materialized-views/image1.jpg)

In PostgreSQL you can create a view basing on a query.
```sql
CREATE VIEW my_view AS SELECT
                         list_id,
                         event_id,
                         sum(price_paid) AS revenue,
                         count(qty_sold) AS qty
                       FROM sales
                         WHERE local_date >= '2018-01-01'
                       GROUP BY list_id, event_id;
```

Each time you select the data from such a view, the query underneath will be executed. If the query takes a long time to execute, a materialized view might be used.

```sql
CREATE MATERIALIZED VIEW my_view AS SELECT (...) ;
```

This view is populated with data at the time of creation, therefore there is no need to run the time consuming query each time you access the data. However, each time the data changes, the view needs to be refreshed manually with `REFRESH MATERIALIZED VIEW my_view` query. The materialized view is especially useful when your data changes infrequently and predictably. A perfect use case is an ETL process - the refresh query might be run as a part of it.

As Redshift is based on PostgreSQL, one might expect Redshift to have materialized views. Unfortunately, Redshift does not implement this feature. Regular views in Redshift have two main disadvantages:
 * the Redshift query planner does not optimize through views; therefore fetching data from a view instead of running the query directly may actually be slower,
 * the views in Redshift are connected to the table (not just its name), so you will encounter errors while altering the table; using `WITH NO SCHEMA BINDING` clause tells Redshift not to bound to the underlying database objects.

Instead of using a view, we can create a table basing on a query (and drop and recreate it each time). As it is a regular table, it’s possible to define sort keys to further improve the performance.

The ease of data refresh might be reckoned as an advantage of a materialized view. To achieve a similar behaviour with table, we can use a regular view to actually store the query. The downside of such a solution is that inserting data into the table through the view will take longer than with the query. Recreating a table with data through a view could be as simple as the two following statements wrapped into a transaction block:

```sql
BEGIN TRANSACTION;
DROP TABLE my_view_table;
CREATE TABLE my_view_table AS SELECT * FROM my_view;
COMMIT TRANSACTION;
```

This piece of code has two main issues:
 * `DROP` command in transaction puts a `LOCK` on the table, so other processes will need to wait, when trying to access the data; moreover, if you commit the transaction, the process awaiting will receive an error like `table 1234556 dropped by concurrent transaction`,
 * any sort key added to the table will be lost.

Deleting all data from the table, although seems easy to implement, requires `VACUUM` and `ANALYZE` which might be quite long. A faster alternative to an unqualified `DELETE` is `TRUNCATE`. However, it commits the transaction in which it is run and cannot be rolled back. Another way is to use the `CREATE TABLE ... LIKE` statement to create an intermediate table. This statement copies column names, data types and `NOT NULL` constraints. Tables created with the `LIKE` option also inherit distribution style and sort keys (but do not inherit primary and foreign key constraints).

```sql
BEGIN TRANSACTION;
CREATE TABLE my_view_table_new LIKE my_view_table;
INSERT INTO my_view_table_new SELECT * FROM my_view;
ALTER TABLE RENAME my_view_table TO my_view_table_old;
ALTER TABLE RENAME my_view_table_new TO my_view_table;
DROP TABLE my_view_table_old;
COMMIT;
END TRANSACTION;
```

To see the code of the query used to create the view you can log into the database with `psql` and run `\d+ my_view`.

Redshift does not implement materialized views, but it is quite straightforward to simulate a similar behaviour. The only question to ask is if we need the data refresh to be rather simpler or faster.
