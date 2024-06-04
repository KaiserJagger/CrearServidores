const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');
const inquirer = require('inquirer');


const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout || stderr);
      }
    });
  });
};

const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: '¿Cuál es el nombre del proyecto?',
  },
  {
    type: 'confirm',
    name: 'opUsers',
    message: '¿Deseas instalar el componente de usuarios?',
  },
  {
    type: 'confirm',
    name: 'opProducts',
    message: '¿Deseas instalar el componente de productos?',
  },
  {
    type: 'confirm',
    name: 'opRouters',
    message: '¿Deseas instalar el componente de Rutas?',
  },
  {
    type: 'confirm',
    name: 'opModels',
    message: '¿Deseas instalar el componente de Modelos?',
  },
  {
    type: 'confirm',
    name: 'opControllers',
    message: '¿Deseas instalar el componente de Controladores?',
  },
  {
    type: 'confirm',
    name: 'opReactProject',
    message: '¿Deseas crear un proyecto de React?',
  },
];

async function createDirectory(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Directorio creado: ${dir}`);
  } catch (error) {
    console.error(`Ha ocurrido un error al crear el directorio ${dir}:`, error);
  }
}

async function createAppFile(projectDir) {
  try {
    const appJsCode = `
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de usuarios
import userRouter from './routers/user.router.js';
app.use('/users', userRouter);

// Rutas de productos
import productRouter from './routers/product.router.js';
app.use('/products', productRouter);

// Carpeta public
app.use(express.static('public'));

// Conexión a la base de datos
import mongoose from 'mongoose';
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conexión a la base de datos exitosa');
}).catch((error) => {
  console.error('Error al conectar a la base de datos:', error);
});

app.listen(PORT, () => {
  console.log(\`Servidor corriendo en el puerto \${PORT}\`);
});
`;
    await fs.writeFile(path.join(projectDir, 'src', 'app.js'), appJsCode);
    console.log('El archivo app.js ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el archivo app.js:', error);
  }
}

async function createUserFile(projectDir) {
  try {
    const userJsCode = `
import User from '../models/user.model.js';

export async function getAllUsers(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Exportar las funciones del controlador
export default {
  getAllUsers,
  getUserById,
  // Agregar aquí más funciones del controlador según sea necesario
};
`;
    await fs.writeFile(path.join(projectDir, 'src', 'controllers', 'user.controller.js'), userJsCode);
    console.log('El archivo de usuario ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el archivo de usuario:', error);
  }
}

async function createProductFile(projectDir) {
  try {
    const productJsCode = `
import Product from '../models/product.model.js';

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Exportar las funciones del controlador
export default {
  getAllProducts,
  getProductById,
  // Agregar aquí más funciones del controlador según sea necesario
};
`;
    await fs.writeFile(path.join(projectDir, 'src', 'controllers', 'product.controller.js'), productJsCode);
    console.log('El archivo de producto ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el archivo de producto:', error);
  }
}

async function createRoutes(projectDir, opUsers, opProducts) {
  try {
    if (opUsers) {
      const userRouterJsCode = `
import express from 'express';
import userController from '../controllers/user.controller.js';
const router = express.Router();

// Rutas de usuarios
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);

export default router;
`;
      await fs.writeFile(path.join(projectDir, 'src', 'routers', 'user.router.js'), userRouterJsCode);
    }

    if (opProducts) {
      const productRouterJsCode = `
import express from 'express';
import productController from '../controllers/product.controller.js';
const router = express.Router();

// Rutas de productos
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProductById);

export default router;
`;
      await fs.writeFile(path.join(projectDir, 'src', 'routers', 'product.router.js'), productRouterJsCode);
    }

    console.log('Las rutas han sido creadas con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear las rutas:', error);
  }
}

async function createModels(projectDir, opUsers, opProducts) {
  try {
    if (opUsers) {
      const userModelJsCode = `
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

export default User;
`;
      await fs.writeFile(path.join(projectDir, 'src', 'models', 'user.model.js'), userModelJsCode);
    }

    if (opProducts) {
      const productModelJsCode = `
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
`;
      await fs.writeFile(path.join(projectDir, 'src', 'models', 'product.model.js'), productModelJsCode);
    }

    console.log('Los modelos han sido creados con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear los modelos:', error);
  }
}

async function createPublicFolder(projectDir) {
  try {
    const indexHtmlCode = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Bienvenido</h1>
  <p>Esta es la página principal de tu aplicación.</p>
</body>
</html>
`;
    await fs.writeFile(path.join(projectDir, 'src', 'public', 'index.html'), indexHtmlCode);
    console.log('La carpeta public y el archivo index.html han sido creados con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear la carpeta public y el archivo index.html:', error);
  }
}

async function createEnvFile(projectDir) {
  try {
    const envContent = `
PORT=8080
DB_URI=mongodb://localhost:27017/mydatabase
`;
    await fs.writeFile(path.join(projectDir, '.env'), envContent);
    console.log('El archivo .env ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el archivo .env:', error);
  }
}

async function main() {
  const answers = await inquirer.prompt(questions);
  const projectDir = path.join('C:\\Users\\nicoc\\Desktop\\KaiserJager\\CrearServidores', answers.projectName);

  try {
    await createDirectory(projectDir);
    await createDirectory(path.join(projectDir, 'src'));
    await createDirectory(path.join(projectDir, 'src', 'controllers'));
    await createDirectory(path.join(projectDir, 'src', 'models'));
    await createDirectory(path.join(projectDir, 'src', 'routers'));
    await createDirectory(path.join(projectDir, 'src', 'public'));

    await createAppFile(projectDir);
    await createEnvFile(projectDir);
    await createRoutes(projectDir, answers.opUsers, answers.opProducts);
    await createModels(projectDir, answers.opUsers, answers.opProducts);
    await createUserFile(projectDir);
    await createProductFile(projectDir);
    await createPublicFolder(projectDir);

    if (answers.opReactProject) {
      await execCommand(`cd ${projectDir} && npx create-react-app client`);
      await execCommand(`cd ${projectDir}/client && npm install axios react-router-dom`);
      console.log('Las dependencias de React se han instalado con éxito.');
    }

    console.log('El proyecto Express ha sido creado con éxito.');
  } catch (error) {
    console.error('Ha ocurrido un error al crear el proyecto:', error);
  }
}

main();
