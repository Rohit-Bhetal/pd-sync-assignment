export interface InputDataType{
    fullName:string,
    emailAdress:string,
    phoneNumber:PhoneNumberType,
    address:AddressType
}
export interface MappingDataType{
    pipedriveKey:string,
    inputKey:string
}

export interface PipeDrivePayloadType{
    name:string,
    email:string,
    phone:string
}
 interface PhoneNumberType{
    home:string,
    work:string
 }
 interface AddressType{
    country: string,
    street: string,
    city: string,
    state:string,
    zip: string
 }

