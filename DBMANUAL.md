##### Table of Contents

1. [Overview](#overview)
2. [Advantages](#advantages)
3. [Database Functions](#database-functions)
   - [poolConnect(connection, options)](#poolConnect(connection,-options))

   - [getAll(connection, options)](#getAll(connection,-options))

   - [getOne(connection, options)](#getOne(connection,-options))

   - [getMulti(connection, options)](#getMulti(connection,-options))

   - [insertOne(connection, options)](#insertOne(connection,-options))

   - [insertIntoMultiData(connection, options)](#insertIntoMultiData(connection,-options))

   - [insertIntoMultiTables(connection, options)](#insertIntoMultiTables(connection,-options))

   - [deleteOne(connection, options)](#deleteOne(connection,-options))

   - [foreignKeyMode(connection, mode)](#foreignKeyMode(connection,-mode))

4. [Customer Error Handling](#Customer-Error-Handling)
5. [Latest Updates](#latest-updates)
6. [History](#history)

## Overview

    This manual is completely responsible for manipulating SQL Query by user friendly method. One of the big advantage of this manual to use mongoose db functions look like same with sql functions.

```
A different method is a different vision of life.
                               *** - by Md ***
```

## Advantages

- **User Friendly** syntax.
- All the operations done by within a min such as transaction, get, update and so on.
- Single line of code to initialize for magin happening.

## Database Functions

> ***Important*** :  <br>
> The below database functions take care of specific functionality. So you need to import major one function ***poolConnect(connection, options)*** when the route was initiated. <br>
> Don't forgot to pass connection parameters to each functions because of connection is dynamic things of pool connection in mysql. <br>
> Read more about [pool connection](https://www.npmjs.com/package/mysql#pooling-connections) 

## common parameters

Each function had to pass two parameters such as connection __object__ and options __opjects__. You can refer below the possible options.

> connection - This is the standard object when connection was created into route handle by poolConnect method. <br>
> options 
- ***table_name*** or ***table_names*** : To specify sinlge table name.
- ***projection*** or ***projections*** : To specify the columns name to get from db
- ***condition*** or ***conditions*** :  <br>
    To set the condition of query for getting corresponding data from db. Here ***you need to put '?' sign whenever you put some value that place.**
- ***value*** or ***values*** : Replace '?' into some values by this array of values or single value. If you need to put more than one value or **in other words more than on '?' use array of values one by one into the array.** Otherwise just simple put one value without array it's also supported.

> Note : <br>
> please note it down when to use plural form of options or singler form of options. It's completely depends on function name more giving more descriptiveness.

> Return value : <br>
    - Each and every function return ***Promise***. So you can use latest ES6 feature await and arrow functions for getting results.
    - Promise resolved by data come from tables.

### poolConnect(connection, options)

You can see the modal GET request by using dynamic pool connection. so only thing is you need to import poolConnection from ```../db/index.js``` file and also you need to import pool connection object from ```../config/index.js```. Finally pass the pool connection object to ```poolConnect(pool)``` method. Everything looks fine and now ready to go for make your route. 


```js
router.get('/test', async (req, res) => {

   try {
    // get a pool connection
    const connection = await poolConnect(pool);

    try {
      // make your code here

    } finally {
      // Close your connection here after send response
      pool.releaseConnection(connection);
    }

  } catch (err) {
    // 500
    if (err.code)
      Logger.info(chalk`code : {red ${err.code}}\nmessage : {yellow ${err.sqlMessage}}\nsql : {green ${err.sql}}`);
    else Logger.info(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
  }

});
```

### getAll(connection, options)

```js
    const result = await getAll(connection, {
        table_names : 'users, admins',
        projections : '*'                // '*' indigates all the columns from the table
    });
```

### getOne(connection, options)

```js
    const result = await getOne(connection, {
        table_name : 'users, admins',
        projection : '*',
        condition : 'users.id = admins.id and admins.id = ?',
        values : 2                  // You can pass sinlge value or array of value depends upon no.on '?'
    });
```

### getMulti(connection, options)

```js
    const result = await getMulti(connection, {
        table_names : 'users u, admins a',
        projections : 'id, ',
        conditions : 'u.id = admins.id and a.id = ? and u.id = ?',
        values : [2, 6]
    });
```

### insertOne(connection, options)

```js
    const result = await insertOne(connection, {
        table_name : 'users',
        data : {
            firstName : 'Md',
            lastName : 'jack',
            password : 'something',
            email : 'mdjack@gmail.com'
        }
    });
```

### insertIntoMultiData(connection, options)

```js
    const result = await insertIntoMultiData(connection, {
        table_name : 'users',
        data : [{
            firstName : 'Md',
            lastName : 'jack',
            password : 'something',
            email : 'mdjack@gmail.com'
        },
        {
            firstName : 'Jhon',
            lastName : 'smith',
            password : 'something',
            email : 'jhon.smith@gmail.com'
        }]
    });
```

### insertIntoMultiTables(connection, options)

```js
    const result = await insertIntoMultiTables(connection, [
        {
            table_name : 'users',
            data : {
                email : 'mdjack@gmail.com',
                password : 'something',
                role : 'admin'
            }
        },
        {
            table_name : 'admins',
            data : {
                user_id : result[0].insertedId,
                firstName : 'Md',
                lastName : 'jack',
            }
        },
    ]);
```

### deleteOne(connection, options)

```js
    const result = await deleteOne(connection, {
        table_name : 'users',
        condition : 'id = ?',
        value : 2
    });
```

### foreignKeyMode(connection, mode)

> Note : <br>
> Here ***0*** means foreign key constraint disable on your db. <br>
> and ***1*** means foreign key constraint enable on your db. <br>

```js
    const result = await foreignKeyMode(connection, 0);     // 0 or 1
```

## Customer Error Handling

## Latest Updates

## History
