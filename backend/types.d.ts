declare module 'malogg' {
    const malogg: any
    export default malogg
}

declare module 'json-web-token' {
    function jwt(data: any, secret: string, options?: any): string
    export default jwt
}
