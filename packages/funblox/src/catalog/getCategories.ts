/* eslint-disable require-jsdoc */
import {catalog} from '../api';

export default function getCategories(): Promise<Object> {
  return new Promise(async (resolve, reject) => {
    try {
      const categories = await catalog.get('v1/categories');

      resolve(categories.data);
    } catch (e) {
      reject(e);
    }
  });
}
