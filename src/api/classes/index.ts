import { GetAddressBalanceRequest } from './GetAddressBalance/GetAddressBalanceRequest'
import { GetAddressBalanceResponse } from './GetAddressBalance/GetAddressBalanceResponse'
import { GetAddressDeltasRequest } from './GetAddressDeltas/GetAddressDeltasRequest'
import { GetAddressDeltasResponse } from './GetAddressDeltas/GetAddressDeltasResponse'
import { GetAddressUtxosRequest } from './GetAddressUtxos/GetAddressUtxosRequest'
import { GetAddressUtxosResponse } from './GetAddressUtxos/GetAddressUtxosResponse'
import { GetBlockRequest } from './GetBlock/GetBlockRequest'
import { GetBlockResponse } from './GetBlock/GetBlockResponse'
import { GetBlockCountRequest } from './GetBlockCount/GetBlockCountRequest'
import { GetBlockCountResponse } from './GetBlockCount/GetBlockCountResponse'
import { GetVdxfIdRequest } from './GetVdxfId/GetVdxfIdRequest'
import { GetVdxfIdResponse } from './GetVdxfId/GetVdxfIdResponse'
import { GetIdentityRequest } from './GetIdentity/GetIdentityRequest'
import { GetIdentityContentRequest } from './GetIdentityContent/GetIdentityContentRequest'
import { GetIdentityResponse } from './GetIdentity/GetIdentityResponse'
import { GetCurrencyRequest } from './GetCurrency/GetCurrencyRequest'
import { GetCurrencyResponse } from './GetCurrency/GetCurrencyResponse'
import { GetInfoRequest } from './GetInfo/GetInfoRequest'
import { GetInfoResponse } from './GetInfo/GetInfoResponse'
import { GetOffersRequest } from './GetOffers/GetOffersRequest'
import { GetOffersResponse } from './GetOffers/GetOffersResponse'
import { GetRawTransactionRequest } from './GetRawTransaction/GetRawTransactionRequest'
import { GetRawTransactionResponse } from './GetRawTransaction/GetRawTransactionResponse'
import { MakeOfferRequest } from './MakeOffer/MakeOfferRequest'
import { MakeOfferResponse } from './MakeOffer/MakeOfferResponse'
import { SendRawTransactionRequest } from './SendRawTransaction/SendRawTransactionRequest'
import { SendRawTransactionResponse } from './SendRawTransaction/SendRawTransactionResponse'
import { SignMessageRequest } from './SignMessage/SignMessageRequest'
import { SignMessageResponse } from './SignMessage/SignMessageResponse'
import { SignDataRequest } from './SignData/SignDataRequest'
import { SignDataResponse } from './SignData/SignDataResponse'
import { VerifyMessageRequest } from './VerifyMessage/VerifyMessageRequest'
import { VerifyMessageResponse } from './VerifyMessage/VerifyMessageResponse'
import { GetAddressMempoolResponse } from './GetAddressMempool/GetAddressMempoolResponse'
import { GetAddressMempoolRequest } from './GetAddressMempool/GetAddressMempoolRequest'
import { SendCurrencyRequest } from './SendCurrency/SendCurrencyRequest'
import { SendCurrencyResponse } from './SendCurrency/SendCurrencyResponse'
import { UpdateIdentityRequest } from './UpdateIdentity/UpdateIdentityRequest'
import { UpdateIdentityResponse } from './UpdateIdentity/UpdateIdentityResponse'
import { FundRawTransactionRequest } from './FundRawTransaction/FundRawTransactionRequest'
import { FundRawTransactionResponse } from './FundRawTransaction/FundRawTransactionResponse'
import { SignRawTransactionRequest } from './SignRawTransaction/SignRawTransactionRequest'
import { SignRawTransactionResponse } from './SignRawTransaction/SignRawTransactionResponse'
import { GetCurrencyConvertersRequest } from './GetCurrencyConverters/GetCurrencyConvertersRequest'
import { GetCurrencyConvertersResponse } from './GetCurrencyConverters/GetCurrencyConvertersResponse'
import { ListCurrenciesRequest } from './ListCurrencies/ListCurrenciesRequest'
import { ListCurrenciesResponse } from './ListCurrencies/ListCurrenciesResponse'
import { EstimateConversionRequest } from './EstimateConversion/EstimateConversionRequest'
import { EstimateConversionResponse } from './EstimateConversion/EstimateConversionResponse'
import { ZGetOperationStatusRequest } from './ZGetOperationStatus/ZGetOperationStatusRequest'
import { ZGetOperationStatusResponse } from './ZGetOperationStatus/ZGetOperationStatusResponse'

export {
  GetAddressBalanceRequest,
  GetAddressBalanceResponse,
  GetAddressDeltasRequest,
  GetAddressDeltasResponse,
  GetAddressMempoolRequest,
  GetAddressMempoolResponse,
  GetAddressUtxosRequest,
  GetAddressUtxosResponse,
  GetBlockRequest,
  GetBlockResponse,
  GetBlockCountRequest,
  GetBlockCountResponse,
  GetVdxfIdRequest,
  GetVdxfIdResponse,
  GetIdentityRequest,
  GetIdentityContentRequest,
  GetIdentityResponse,
  GetCurrencyRequest,
  GetCurrencyResponse,
  GetOffersRequest,
  GetOffersResponse,
  GetRawTransactionRequest,
  GetRawTransactionResponse,
  MakeOfferRequest,
  MakeOfferResponse,
  SendRawTransactionRequest,
  SendRawTransactionResponse,
  GetInfoRequest,
  GetInfoResponse,
  VerifyMessageRequest,
  VerifyMessageResponse,
  SignMessageRequest,
  SignMessageResponse,
  SignDataRequest,
  SignDataResponse,
  SendCurrencyRequest,
  SendCurrencyResponse,
  UpdateIdentityRequest,
  UpdateIdentityResponse,
  FundRawTransactionRequest,
  FundRawTransactionResponse,
  GetCurrencyConvertersRequest,
  GetCurrencyConvertersResponse,
  ListCurrenciesRequest,
  ListCurrenciesResponse,
  EstimateConversionRequest,
  EstimateConversionResponse,
  ZGetOperationStatusRequest,
  ZGetOperationStatusResponse,
  SignRawTransactionRequest,
  SignRawTransactionResponse
}

export type RpcRequest =
  | typeof MakeOfferRequest
  | typeof GetOffersRequest
  | typeof GetAddressBalanceRequest
  | typeof GetAddressDeltasRequest
  | typeof GetAddressMempoolRequest
  | typeof GetAddressUtxosRequest
  | typeof GetBlockRequest
  | typeof GetBlockCountRequest
  | typeof GetVdxfIdRequest
  | typeof GetInfoRequest
  | typeof GetIdentityRequest
  | typeof GetIdentityContentRequest
  | typeof GetCurrencyRequest
  | typeof SendRawTransactionRequest
  | typeof GetRawTransactionRequest
  | typeof VerifyMessageRequest
  | typeof SignMessageRequest
  | typeof SignDataRequest
  | typeof SendCurrencyRequest
  | typeof UpdateIdentityRequest
  | typeof FundRawTransactionRequest
  | typeof GetCurrencyConvertersRequest
  | typeof ListCurrenciesRequest
  | typeof EstimateConversionRequest
  | typeof ZGetOperationStatusRequest
  | typeof SignRawTransactionRequest;

export type RpcResponse =
  | typeof MakeOfferResponse
  | typeof GetOffersResponse
  | typeof GetAddressBalanceResponse
  | typeof GetAddressDeltasResponse
  | typeof GetAddressMempoolResponse
  | typeof GetAddressUtxosResponse
  | typeof GetBlockResponse
  | typeof GetBlockCountResponse
  | typeof GetVdxfIdResponse
  | typeof GetInfoResponse
  | typeof GetIdentityResponse
  | typeof GetCurrencyResponse
  | typeof SendRawTransactionResponse
  | typeof GetRawTransactionResponse
  | typeof VerifyMessageResponse
  | typeof SignMessageResponse
  | typeof SignDataResponse
  | typeof SendCurrencyResponse
  | typeof UpdateIdentityResponse
  | typeof FundRawTransactionResponse
  | typeof GetCurrencyConvertersResponse
  | typeof ListCurrenciesResponse
  | typeof EstimateConversionResponse
  | typeof ZGetOperationStatusResponse
  | typeof SignRawTransactionResponse;
