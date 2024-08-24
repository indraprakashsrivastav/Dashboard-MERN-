import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";

import generalRoutes from "./routes/generalRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import managementRoutes from "./routes/managementRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import Product from "./models/Product.js";
import {
  dataAffiliateStat,
  dataOverallStat,
  dataProduct,
  dataProductStat,
  dataTransaction,
} from "./data/index.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";

// CONFIGURATION
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// ROUTES
app.use("/general", generalRoutes);
app.use("/client", clientRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);

// MONGOOSE SETUP
const PORT = process.env.PORT || 9000;

const upsertDocuments = async () => {
  try {
    await Promise.all([
      Product.bulkWrite(
        dataProduct.map(item => ({
          updateOne: {
            filter: { _id: item._id },
            update: item,
            upsert: true
          }
        }))
      ),
      ProductStat.bulkWrite(
        dataProductStat.map(item => ({
          updateOne: {
            filter: { _id: item._id },
            update: item,
            upsert: true
          }
        }))
      ),
      Transaction.bulkWrite(
        dataTransaction.map(item => ({
          updateOne: {
            filter: { _id: item._id },
            update: item,
            upsert: true
          }
        }))
      ),
      OverallStat.bulkWrite(
        dataOverallStat.map(item => ({
          updateOne: {
            filter: { _id: item._id },
            update: item,
            upsert: true
          }
        }))
      ),
      AffiliateStat.bulkWrite(
        dataAffiliateStat.map(item => ({
          updateOne: {
            filter: { _id: item._id },
            update: item,
            upsert: true
          }
        }))
      )
    ]);
    console.log('Documents upserted successfully');
  } catch (error) {
    console.error('Error upserting documents:', error);
  }
};

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
    upsertDocuments(); // Call the function to upsert documents
  })
  .catch((error) => {
    console.log(error.message);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});
