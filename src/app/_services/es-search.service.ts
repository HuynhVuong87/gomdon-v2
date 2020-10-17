import { Injectable } from '@angular/core';

import { Client } from 'elasticsearch-browser';
import { AngularFirestore } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root',
})
export class EsSearchService {
  private esClient = new Client({
    host:
      'https://search-gomdon-o7c7qz3c4lr7d26yntc4uowt6y.us-east-2.es.amazonaws.com/',
  });
  constructor(private afs: AngularFirestore) {
    this.esClient.ping(
      {
        // ping usually has a 3000ms timeout
        requestTimeout: 1000,
      },
      (error) => {
        if (error) {
        } else {
          console.log('ok');
        }
      }
    );
  }

  async searchSell(text: string) {
    if (text.length > 6) {
      const data = [];
      const docs = await this.afs.firestore
        .collection('sells')
        .where('shipping_traceno', '==', text.toUpperCase())
        .get();
      docs.forEach((doc) => data.push(doc.data()));
      return data;
    }

    // const response = await this.esClient.search({
    //   index: 'sells',
    //   body: {
    //     size: 10,
    //     query: {
    //       query_string: {
    //         fields: ['order_sn', 'shipping_traceno'],
    //         // tslint:disable-next-line: quotemark
    //         query: `*${text.toUpperCase()}*`,
    //       },
    //     },
    //   },
    // });
    // return response.hits.hits.map((x) =>
    //   Object.assign(
    //     {
    //       _id: x._id,
    //     },
    //     x._source
    //   )
    // );
  }

  async getByQuery(index: string, field: string, query: any, uid?: string) {
    const _query = new Object();
    _query[field] = query;
    const must = [
      {
        match: _query,
      },
    ];
    if (uid) {
      must.push({
        match: {
          'create_by.uid': uid,
        },
      });
    }
    const response = await this.esClient.search({
      index,
      body: {
        size: 10000,
        query: {
          bool: {
            must,
          },
        },
      },
    });
    return response.hits.hits.map((x) =>
      Object.assign(
        {
          _id: x._id,
        },
        x._source
      )
    );
  }

  async setIndexDoc(index: string, body: object, id?: string) {
    const response = await this.esClient.index({
      index,
      type: '_doc',
      id: id || '',
      body,
    });
    return response;
  }

  async getIndex(index: string, size?: number) {
    const response = await this.esClient.search({
      index,
      body: {
        size: size || 10000,
        query: {
          match_all: {},
        },
      },
    });
    return response.hits.hits.map((x) => x._source);
  }

  // tslint:disable-next-line: variable-name
  async getByNested(index: string, default_field: string, query: string) {
    const response = await this.esClient.search({
      index,
      body: {
        query: {
          query_string: {
            default_field,
            // default_field: 'models.gomdon_name', //example
            query,
          },
        },
      },
    });
    return response.hits.hits.map((x) => x._source);
  }
}
