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
import { ProductClassify } from './productClassify';


/**
 * Dữ liệu chuẩn của bảng Product
 */
export interface Product { 
    gomdon_by?: string;
    /**
     * mảng các phân loại của sản phẩm
     */
    classify?: Array<ProductClassify>;
    gomdon_ctime?: number;
    /**
     * Tên tiếng việt của sản phẩm
     */
    gomdon_product_name?: string;
    images_preview?: string;
    /**
     * Tên nhà bán trên 1688
     */
    linked_company_name?: string;
    /**
     * Id của sản phẩm trên trang 1688
     */
    linked_product_id?: string;
    gomdon_id?: string;
    gomdon_sku?: string;
    /**
     * Tên trung quốc của sản phẩm (lấy trên 1688)
     */
    name_china?: string;
}

