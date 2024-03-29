const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');
const inquirer = require('inquirer');

// Pregunta para el usuario: nombre del proyecto
const projectQuestion = {
  type: 'input',
  name: 'projectName',
  message: 'Ingrese el nombre del proyecto:',
  validate: function (input) {
    if (input.trim() === '' || /[A-Z]/.test(input))  {
      return 'Por favor, ingrese un nombre válido para el proyecto.';
    }
    return true;
  },
};

const reactProjectQuestion = {
  type: 'confirm',
  name: 'opReactProject',
  message: '¿Deseas crear un proyecto de React?',
  default: true,
  when: (answers) => !answers.opInstallAutomatically,
};

// Opciones de instalación de user y Products
const questions = [
  projectQuestion,

  {
    type: 'confirm',
    name: 'opUsers',
    message: '¿Deseas instalar el componente de usuarios?',
    default: true,
  },

  {
    type: 'confirm',
    name: 'opProducts',
    message: '¿Deseas instalar el componente de productos?',
    default: true,
  },

  {
    type: 'confirm',
    name: 'opRouters',
    message: '¿Deseas instalar el componente de Rutas?',
    default: true,
    when: (answers) => !answers.opInstallAutomatically,
  },

  {
    type: 'confirm',
    name: 'opModels',
    message: '¿Deseas instalar el componente de Modelos?',
    default: true,
    when: (answers) => !answers.opInstallAutomatically,
  },

  {
    type: 'confirm',
    name: 'opControllers',
    message: '¿Deseas instalar el componente de Controladores?',
    default: true,
    when: (answers) => !answers.opInstallAutomatically,
  },

  reactProjectQuestion,
];


// Función para ejecutar comandos de forma asíncrona
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error('Error al ejecutar el comando: ' + error.message));
      } else {
        resolve();
      }
    });
  });
}

// Función para crear el archivo app.js
async function createAppFile(projectDir, opRouters, opProducts, opUsers) {
  try {
    const importProdRouter = opRouters && opProducts ? `import productRouter from './routers/product.router.js';\n` : '';
    const importUserRouter = opRouters && opUsers ? `import userRouter from './routers/user.router.js';\n` : '';

    const appJsCode = `
      import express from 'express';
      import mongoose from 'mongoose'; // Importar mongoose
      import dotenv from 'dotenv';
      
      // Cargar variables de entorno desde el archivo .env
      dotenv.config();
      
      // Variables de entorno
      const { DB_USER, DB_PASS } = process.env;

      // Configurar la conexión a la base de datos MongoDB utilizando las variables de entorno
      mongoose.connect(\`mongodb+srv://\${DB_USER}:\${DB_PASS}@cluster0.4xe3vat.mongodb.net/database\`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).then(() => console.log('Conexión exitosa a MongoDB'))
        .catch((err) => console.error('Error de conexión a MongoDB: (Modifique las variables de entorno y la conexion de la ddbb)', err));
      
      ${importProdRouter}
      ${importUserRouter}

      const app = express();
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      app.use('/api/products', productRouter);
      app.use('/api/users',  userRouter);

      // Ruta de inicio
      app.get('/', (req, res) => {
        res.send('Bienvenido a mi proyecto');
      });

      app.listen(8080, () => console.log('Servidor en funcionamiento en el puerto 8080'));`;

    await fs.writeFile(path.join(projectDir, 'src/app.js'), appJsCode);

    console.log('El archivo app.js ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el archivo app.js:', error);
  }
}

// Función para crear el archivo .env
async function createEnvFile(projectDir) {
  try {
    const envContent = `
DB_USER=username
DB_PASS=password
    `.trim();

    await fs.writeFile(path.join(projectDir, '.env'), envContent);

    console.log('El archivo .env ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el archivo .env:', error);
  }
}

// Función para crear el archivo de usuario con contenido inicial
async function createUserFile(projectDir) {
  try {
    const controllerDir = path.join(projectDir, 'src/controllers');
    await fs.access(controllerDir).catch(() => fs.mkdir(controllerDir));

    const userJsCode = `// Controlador de Usuarios
    // Importar el modelo de usuarios
    import User from '../models/user.model.js';

// Ejemplo de función para obtener todos los usuarios
async function getAllUsers(req, res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Ejemplo de función para obtener un usuario por su ID
async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Exportar las funciones del controlador
export default 
  getAllUsers
  getUserById
  // Agregar aquí más funciones del controlador según sea necesario

`;
    await fs.writeFile(path.join(controllerDir, 'user.controller.js'), userJsCode);

    console.log('El archivo de usuario ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el archivo de usuario:', error);
  }
}

// Función para crear el archivo de producto con contenido inicial
async function createProductFile(projectDir) {
  try {
    const controllerDir = path.join(projectDir, 'src/controllers');
    await fs.access(controllerDir).catch(() => fs.mkdir(controllerDir));

    const productJsCode = `// Controlador de Productos
    // Importar el modelo de productos
    import Product from '../models/product.model.js';
    
    // Ejemplo de función para obtener todos los productos
    async function getAllProducts(req, res) {
      try {
        const products = await Product.find();
        res.json(products);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    
    // Ejemplo de función para obtener un producto por su ID
    async function getProductById(req, res) {
      try {
        const product = await Product.findById(req.params.productId);
        if (product) {
          res.json(product);
        } else {
          res.status(404).json({ message: 'Producto no encontrado' });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    
    // Exportar las funciones del controlador
    export default 
      getAllProducts
      getProductById
    // Agregar aquí más funciones del controlador según sea necesario
`;
    await fs.writeFile(path.join(controllerDir, 'product.controller.js'), productJsCode);

    console.log('El controlador de producto ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el archivo de producto:', error);
  }
}

// Función para crear las rutas con contenido inicial
async function createRoutes(projectDir, opRouters, opProducts, opUsers) {
  try {
    if (!opRouters) return;

    const routersDir = path.join(projectDir, 'src/routers');
    await fs.access(routersDir).catch(() => fs.mkdir(routersDir));

    if (opProducts) {
      const productRouterJsCode = `// Rutas de Productos
import express from 'express';
const productRouter = express.Router();

// Importar el controlador de productos
import getAllProducts from '../controllers/product.controller.js';
import getProductById from '../controllers/product.controller.js';


// Definir ruta para obtener todos los productos
productRouter.get('/', getAllProducts);

// Definir ruta para obtener un producto por su ID
productRouter.get('/:productId', getProductById);

// Agregar más rutas según sea necesario

export default productRouter;`;
      
      await fs.writeFile(path.join(routersDir, 'product.router.js'), productRouterJsCode);
      console.log('El archivo de rutas para productos ha sido creado con éxito.');
    }

    if (opUsers) {
      const userRouterJsCode = `// Rutas de Usuarios
import express from 'express';
const userRouter = express.Router();

// Importar el controlador de usuarios
import getUserById from '../controllers/user.controller.js';
import getAllUsers from '../controllers/user.controller.js';

// Definir ruta para obtener todos los usuarios
userRouter.get('/', getAllUsers);

// Definir ruta para obtener un usuario por su ID
userRouter.get('/:userId', getUserById);

// Agregar más rutas según sea necesario

export default userRouter;`;
      await fs.writeFile(path.join(routersDir, 'user.router.js'), userRouterJsCode);

      console.log('El archivo de rutas para usuarios ha sido creado con éxito.');
    }
  } catch (error) {
    console.error('Ha ocurrido un error al crear las rutas:', error);
  }
}

// Función para crear los modelos con contenido inicial
async function createModels(projectDir, opModels, opProducts, opUsers) {
  try {
    if (!opModels) return;

    const modelsDir = path.join(projectDir, 'src/models');
    await fs.access(modelsDir).catch(() => fs.mkdir(modelsDir));

    if (opProducts) {
      const productModelJsCode = `// Modelo de Productos

// Definir el esquema de Productos y las operaciones relacionadas

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Agregar aquí las definiciones del esquema de productos
});

const Product = mongoose.model('Product', productSchema);

export default Product;
`;
      await fs.writeFile(path.join(modelsDir, 'product.model.js'), productModelJsCode);

      console.log('El archivo de modelo para productos ha sido creado con éxito.');
    }

    if (opUsers) {
      const userModelJsCode = `// Modelo de Usuarios

// Definir el esquema de Usuarios y las operaciones relacionadas

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Agregar aquí las definiciones del esquema de usuarios
});

const User = mongoose.model('User', userSchema);

export default User;
`;
      await fs.writeFile(path.join(modelsDir, 'user.model.js'), userModelJsCode);

      console.log('El archivo de modelo para usuarios ha sido creado con éxito.');
    }
  } catch (error) {
    console.error('Ha ocurrido un error al crear los modelos:', error);
  }
}

// Función para instalar las dependencias de React
async function installReactDependencies(projectDir, opReactProject) {
  try {
    if (!opReactProject) {
      console.log('Se ha omitido la creación del proyecto de React.');
      return;
    }

    process.chdir(projectDir);

    // Ejecutar `npx create-react-app .`
    await execCommand('npx create-react-app my-app');
    
    // Instalar dependencia axios
    await execCommand('npm install axios');
    
    // Actualizar package.json con el proxy
    const packageJsonPath = 'package.json';
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJsonObject = JSON.parse(packageJsonContent);
    packageJsonObject.proxy = 'http://localhost:8080';
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonObject, null, 2));

    console.log('El proyecto de React ha sido creado y configurado exitosamente.');
  } catch (error) {
    console.error('Ha ocurrido un error durante la instalación de dependencias de React:', error);
    throw error;
  }
}

// Función para crear la carpeta pública con el archivo index.html
async function createPublicFolder(projectDir) {
  try {
    const publicDir = path.join(projectDir, 'public');
    
    // Verificar si el directorio 'public' ya existe
    await fs.access(publicDir).catch(() => fs.mkdir(publicDir));

    const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a mi proyecto</title>
</head>
<body>
  <div id="root"></div>
  <script src="../src/views/index.js"></script>
</body>
</html>`;

    await fs.writeFile(path.join(publicDir, 'index.html'), indexHtmlContent);

    console.log('La carpeta pública con el archivo index.html ha sido creada con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear la carpeta pública y el archivo index.html:', error);
    throw error;
  }
}



// Función para crear el proyecto Express
async function createExpressProject() {
  try {
    // Obtener respuestas del usuario
    const { projectName, ...options } = await inquirer.prompt(questions);
    const projectDir = path.join(__dirname, projectName.trim());

    // Crear la carpeta del proyecto si no existe
    await fs.mkdir(projectDir, { recursive: true });

    // Cambiar al directorio del proyecto
    process.chdir(projectDir);

    // Exec `npm init -y`
    await execCommand('npm init -y');
    await execCommand('npm i express');

    // Update package.json
    const packageJsonPath = 'package.json';
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJsonObject = JSON.parse(packageJsonContent);
    packageJsonObject.main = 'src/app.js';
    packageJsonObject.type = 'module';
    packageJsonObject.scripts.start = 'node .';
    packageJsonObject.scripts.dev = 'nodemon .';
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonObject, null, 2));

    console.log('El proyecto Express ha sido creado exitosamente.');

    // Create src folder
    await fs.mkdir(path.join(projectDir, 'src'));

    // Create the components automatically
    if (options.opInstallAutomatically) {
      await Promise.all([
        fs.mkdir(path.join(projectDir, 'src/routers')),
        fs.mkdir(path.join(projectDir, 'src/controllers')),
        fs.mkdir(path.join(projectDir, 'src/models')),
        fs.mkdir(path.join(projectDir, 'public')),
        execCommand('npm i express-handlebars'),
      ]);
    }

    // Create routes, models, and controllers with content
    await createRoutes(projectDir, options.opRouters, options.opProducts, options.opUsers);
    await createModels(projectDir, options.opModels, options.opProducts, options.opUsers);
    await createUserFile(projectDir);
    await createProductFile(projectDir);

    // Create app.js with content
    await createAppFile(projectDir, options.opRouters, options.opProducts, options.opUsers);

    await createEnvFile(projectDir);
    
    // Install React dependencies
    await installReactDependencies(projectDir, options.opReactProject);
    
    // Create the public folder with index.html
    await createPublicFolder(projectDir);

    console.log('El proyecto Express ha sido configurado exitosamente. Ejecute npm run dev.');
  } catch (error) {
    console.error('Ha ocurrido un error durante la creación del proyecto Express:', error);
    throw error;
  }
}

// Llamar a la función para crear el proyecto Express
createExpressProject();

