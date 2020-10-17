/**
 * Gom Don API
 * Gom Don API.
 *
 * The version of the OpenAPI document: 1.0
 * Contact: huynhnhon.dev@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { SellCreateReceiptOrders } from './sellCreateReceiptOrders';


export interface SellCreateReceipt { 
    bank: string;
    /**
     * Ngày tiền về ví
     */
    gomdon_ctime?: number;
    note?: string;
    my_money?: number;
    ecom_paid?: number;
    orders: Array<SellCreateReceiptOrders>;
}
