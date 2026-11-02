/* Rasterize locally, preserve alpha, and bound the data URI stored in Firestore. */
async function optimizeLogo(data){
  const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('정상적인 이미지 파일인지 확인해 주세요.'));i.src=data});
  if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>64000000)throw Error('이미지가 너무 큽니다. 6,400만 화소 이하로 선택해 주세요.');
  let edge=512;
  for(let attempt=0;attempt<8;attempt++){
    const scale=Math.min(1,edge/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const png=canvas.toDataURL('image/png'),webp=canvas.toDataURL('image/webp',0.86);
    const best=webp.length<png.length?webp:png;
    if(best.length<=80000)return best;
    edge=Math.floor(edge*0.75);
  }
  throw Error('로고를 줄이지 못했어요. 다른 이미지로 선택해 주세요.');
}
