let num = [1, 2, 3];
let res = [];

async function fun() {
  num.forEach(async () => {
    let promise = new Promise((resolve) => {
      //   setTimeout(resolve("hello"), 1000);
      resolve("hello");
    });
    let result = promise;
    // let result = await cloudinary.uploader.upload(image.tempFilePath,{
    //             folder: "users"
    //         });
    console.log(result);
    res.push(result);
  });

  console.log(res);
}
fun();
