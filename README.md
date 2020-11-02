This package is used to initiate the sql with node server by single line for making developer life easy.

To install the server as globally by using following npm command.

> Step 1 :
> To install the init-node-server package as globally by using following command.

```npm
npm i -g init-node-server
```

> Step 2 : <br>
> Initiate the server by following commands and go into the created folder. <br> > **Note** : skip the **Step 1** if aldready done.

```
init-node-server my-server
cd my-server
```

> Step 3 : <br>
> To add your **database** credentials to **.env** file. <br>
> Something look like following key values.

```env
// Database configurations
DB_HOSTNAME='localhost';
DB_USERNAME='root';
DB_PASSWORD='<YOUR_DATABASE_PASSWORD>';
DB_PORT='3306';
DB_NAME='<YOUR_DATABASE_NAME>';
```

> **Important** : <span style="text-decoration : underline"> Uncomment </span> the **.env** file from **.gitignore** file before pushed to github.

> Setp 4 : <br>
> To start the developemnt server by using following command.

```npm
npm run devstart
```

Hurray 🎉🎊🎉

Happy Coding! 😊
