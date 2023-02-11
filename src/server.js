import { ApolloServer } from "apollo-server";
import { read, write } from "./utils/FS.js";

const allCategories = read("categories.json");
const allSubCategories = read("subCategories.json");
const allProducts = read("products.json");

const typeDefs = `
    type Categories {
        id: ID!
        title: String!
        subcategories: [ SubCategories ]
    }

    type SubCategories {
        id: ID!
        title: String!
        product: [ Product ]
    }

    type Product {
        id: ID!
        title: String!
        price: Int!
        subid: Int!
    }

    type Query {
        categories: [ Categories ]!
        subcategories: [ SubCategories ]
        product: [ Product ]
    }

    type Mutation {
        createProduct(title: String! price: Int! subid: Int!): String!
        deleteProduct(id: ID!): ID!
        updateProduct(id: ID! title: String! price: Int!): String!
    }
`;

const resolvers = {
  Query: {
    categories: () => allCategories,
    subcategories: () => allSubCategories,
    product: () => allProducts,
  },
  Mutation: {
    createProduct: async (_, { title, price, subid }) => {
      allProducts.push({
        product_id: allProducts.at(-1)?.product_id + 1 || 1,
        product_title: title,
        product_price: price,
        product_sub_id: subid, // productni Ayollar yoki Erkaklar kiyimiga biriktirish id kiritiladi
      });
      await write("products.json", allProducts);
      return "Successfully new add product";
    },
    deleteProduct: async (_, { id }) => {
      const deleteP = allProducts.findIndex((e) => e.product_id == id);
      await allProducts.splice(deleteP, 1);
      await write("products.json", allProducts);
      return "Successfully delete product";
    },
    updateProduct: async (_, {id, title, price}) => {
      const foundProduct = allProducts.find(e => e.product_id == id)
      foundProduct.product_id = foundProduct.product_id || foundProduct.product_title
      foundProduct.product_title = title || foundProduct.product_title
      foundProduct.product_price = price || foundProduct.product_price
      await write("products.json", allProducts)
      return "Successfully update product"
    }
  },
  Categories: {
    id: (g) => g.categories_id,
    title: (g) => g.categories_title,
    subcategories: (g) =>
      allSubCategories.filter((e) => e.categories_id == g.subCategories_id),
  },
  SubCategories: {
    id: (g) => g.subCategories_id,
    title: (g) => g.subCategories_title,
    product: (g) =>
      allProducts.filter((e) => e.product_sub_id == g.subCategories_id),
  },
  Product: {
    id: (g) => g.product_id,
    title: (g) => g.product_title,
    price: (g) => g.product_price,
    subid: (g) => g.product_sub_id, // productni Ayollar yoki Erkaklar kiyimiga biriktirish id kiritiladi
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(4040, console.log(4040));
