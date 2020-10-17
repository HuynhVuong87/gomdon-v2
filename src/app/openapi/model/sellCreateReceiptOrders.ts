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
import { SellCreateReceiptTransactionLogs } from './sellCreateReceiptTransactionLogs';


export interface SellCreateReceiptOrders { 
    transaction_logs?: Array<SellCreateReceiptTransactionLogs>;
    /**
     * Số tiền đã nhận trước đó
     */
    gomdon_ecom_paid?: number;
    /**
     * Mã đơn hàng
     */
    order_sn?: string;
    /**
     * Số tiền sàn trả
     */
    paid?: number;
    /**
     * Chênh lệch
     */
    offset?: number;
    move_in?: string;
    desc?: string;
    date_receive?: string;
}

