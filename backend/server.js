import express from 'express';
import malogg from 'malogg';
const app = express();


app.use(malogg)
app.get('/health',(req,res)=>{
    res.status(200).json({
        "message":"Server health checked"
    })
})

app.listen(8080,()=>{
    console.log("Server running")
})