import React, { useMemo, useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import type { AppSettings, HuiGroup } from '../types/hui';

interface Props { isOpen:boolean; onClose:()=>void; groups:HuiGroup[]; settings:AppSettings; }
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const money=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+' đồng';
const cycleLabel=(c:HuiGroup['cycle'])=>({daily:'hàng ngày',weekly:'hàng tuần',biweekly:'nửa tháng',monthly:'hàng tháng'}[c]);
const dateVN=(v:string)=>{if(!v)return '........';const [y,m,d]=v.split('-');return d+'/'+m+'/'+y;};

export const HuiAgreementModal:React.FC<Props>=({isOpen,onClose,groups,settings})=>{
 const [groupId,setGroupId]=useState(groups[0]?.id||'');
 const [isGenerating,setIsGenerating]=useState(false);
 const [error,setError]=useState('');
 const selected=useMemo(()=>groups.find(g=>g.id===groupId)||groups[0],[groups,groupId]);
 if(!isOpen)return null;
 const download=async()=>{
  if(!selected||isGenerating)return;
  setError('');setIsGenerating(true);
  const root=document.createElement('div');
  root.className='hui-pdf-document';
  root.style.cssText='position:fixed;left:-10000px;top:0;width:794px;background:#fff;color:#111;z-index:-1;';
  const members=selected.members.map((m,i)=>`<tr><td>${i+1}</td><td class="left">${esc(m.name)}</td><td>${esc(m.phone||'')}</td><td>${money(selected.commissionDefault)}</td><td class="sign-cell"></td></tr>`).join('');
  root.innerHTML=`
   <style>
    .hui-pdf-document{font-family:"Times New Roman",serif;font-size:15px;line-height:1.5;padding:72px 64px;box-sizing:border-box}
    .hui-pdf-document *{box-sizing:border-box}
    .hui-pdf-document .center{text-align:center}
    .hui-pdf-document h1{text-align:center;font-size:20px;margin:26px 0 18px}
    .hui-pdf-document h2{font-size:16px;margin:20px 0 8px}
    .hui-pdf-document p{margin:7px 0}
    .hui-pdf-document .section-title{font-weight:bold;font-size:16px;margin:20px 0 8px}
    .hui-pdf-document table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}
    .hui-pdf-document th,.hui-pdf-document td{border:1px solid #333;padding:7px 5px;text-align:center;vertical-align:middle}
    .hui-pdf-document td.left{text-align:left}
    .hui-pdf-document .sign-cell{height:42px}
    .hui-pdf-document tr{break-inside:avoid;page-break-inside:avoid}
    .hui-pdf-document .signature{text-align:center;margin:48px 0 0 auto;width:230px}
    .hui-pdf-document .note{font-size:12px;font-style:italic;margin-top:26px}
   </style>
   <div class="center"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/><b>Độc lập - Tự do - Hạnh phúc</b><br/>-------------------</div>
   <h1>GIẤY THỎA THUẬN CHƠI HỤI</h1>
   <p>Hôm nay, ngày ..... tháng ..... năm ........, các bên đồng ý ký kết thỏa thuận chơi hụi với các nội dung sau:</p>
   <div class="section-title">I. THÔNG TIN CHỦ HỤI</div>
   <p>Họ và tên: <b>${esc(settings.ownerName)}</b></p><p>Số CCCD/CMND: ${esc(settings.ownerIdNumber)}</p><p>Điện thoại: ${esc(settings.ownerPhone)}</p><p>Địa chỉ cư trú hiện tại: ${esc(settings.ownerAddress)}</p>
   <div class="section-title">II. THỎA THUẬN VỀ DÂY HỤI</div>
   <p>1. Tên dây hụi: <b>${esc(selected.name)}</b>.</p>
   <p>2. Hình thức chơi: Hụi có lãi (đấu giá/kêu giá công khai theo thỏa thuận của các bên).</p>
   <p>3. Giá trị phần hụi gốc: <b>${money(selected.baseAmount)}</b>/phần.</p>
   <p>4. Tổng số phần: <b>${selected.totalShares}</b> phần; số kỳ dự kiến: ${selected.totalShares} kỳ.</p>
   <p>5. Kỳ mở hụi: ${cycleLabel(selected.cycle)}; ngày bắt đầu dự kiến: ${dateVN(selected.startDate)}.</p>
   <p>6. Tiền thảo hụi: Người hốt hụi nộp ${money(selected.commissionDefault)} cho chủ hụi tại kỳ hốt, trừ khi các bên có thỏa thuận khác bằng văn bản.</p>
   <p>7. Quy tắc kỳ đầu: ${selected.firstPotRule==='owner_first'?'Chủ hụi hốt trước, không đấu thăm.':'Đấu thăm bình thường từ kỳ đầu.'}</p>
   <p>8. Việc đóng tiền của hụi viên sống, hụi viên đã hốt, mức lãi và số tiền thực nhận được xác định theo kết quả từng kỳ và quy tắc đã thống nhất; các bên đối chiếu số liệu trước khi ký.</p>
   <div class="section-title">III. CAM KẾT CỦA CÁC BÊN</div>
   <p>1. Hụi viên có trách nhiệm cung cấp thông tin chính xác, đóng góp đầy đủ, đúng hạn và thực hiện nghĩa vụ sau khi hốt hụi theo thỏa thuận.</p>
   <p>2. Chủ hụi có trách nhiệm tổ chức kỳ hụi công khai, ghi nhận đầy đủ việc thu/chi, thông báo kết quả và bàn giao tiền theo thỏa thuận.</p>
   <p>3. Mọi thay đổi hoặc phát sinh phải được các bên xác nhận; tranh chấp được ưu tiên giải quyết bằng thương lượng và theo quy định pháp luật hiện hành.</p>
   <div class="section-title">IV. DANH SÁCH HỤI VIÊN THAM GIA KÝ XÁC NHẬN</div>
   <p>Tên dây hụi: ${esc(selected.name)}</p>
   <table><thead><tr><th>STT</th><th>Họ và tên hụi viên</th><th>Số điện thoại</th><th>Tiền thảo (nếu hốt)</th><th>Ký tên xác nhận</th></tr></thead><tbody>${members}</tbody></table>
   <div class="signature"><b>CHỦ HỤI</b><br/><i>(Ký và ghi rõ họ tên)</i><br/><br/><br/><br/><b>${esc(settings.ownerName)}</b></div>
   <p class="note">Văn bản được tạo từ dữ liệu đang lưu trong Sổ Hụi Thông Minh. Các bên cần đọc, rà soát, thống nhất nội dung và điền các điều khoản còn thiếu trước khi ký.</p>
  `;
  document.body.appendChild(root);
  try{
   const {default:html2pdf}=await import('html2pdf.js');
   const safeName=selected.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9-]+/g,'_');
   await html2pdf().set({
    margin:[10,10,12,10],
    filename:'Thoa_thuan_hui_'+safeName+'.pdf',
    image:{type:'jpeg',quality:0.98},
    html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false},
    jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
    pagebreak:{mode:['css','legacy']}
   }).from(root).save();
  }catch(e){console.error('PDF export failed:',e);setError('Không tạo được PDF. Hãy thử lại hoặc mở ứng dụng bằng trình duyệt Chrome mới nhất.');}
  finally{root.remove();setIsGenerating(false);}
 };
 return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
  <div className="flex justify-between items-center"><div className="flex gap-2 items-center"><FileText className="text-teal-700"/><div><h2 className="font-bold text-lg">Văn bản thỏa thuận hụi</h2><p className="text-xs text-slate-500">Xuất PDF từ dữ liệu chủ hụi và dây hụi</p></div></div><button onClick={onClose}><X/></button></div>
  {groups.length===0?<p className="text-sm text-slate-600">Chưa có dây hụi. Hãy tạo dây hụi trước khi lập văn bản.</p>:<>
   <label className="block text-xs font-semibold">Chọn dây hụi<select value={selected?.id||''} onChange={e=>setGroupId(e.target.value)} className="mt-1 w-full p-3 border rounded-xl text-sm">{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
   <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1"><p><b>Chủ hụi:</b> {settings.ownerName||'Chưa khai báo'}</p><p><b>CCCD:</b> {settings.ownerIdNumber||'Chưa khai báo'}</p><p><b>Dây hụi:</b> {selected?.name}</p><p><b>Thành viên:</b> {selected?.members.length||0}</p><p><b>Định mức:</b> {selected?money(selected.baseAmount):''} / phần</p></div>
   <p className="text-[11px] text-amber-800 bg-amber-50 p-3 rounded-xl">PDF được tạo trực tiếp trên thiết bị. Tệp chứa CCCD, địa chỉ và số điện thoại; hãy bảo quản riêng tư. Đây là bản dự thảo để các bên rà soát trước khi ký.</p>
   {error&&<p className="text-xs text-red-600">{error}</p>}
   <button onClick={()=>void download()} disabled={!selected||!settings.ownerName||!settings.ownerIdNumber||!settings.ownerPhone||!settings.ownerAddress||isGenerating} className="w-full p-3 rounded-xl bg-teal-700 text-white font-bold disabled:opacity-40"><Download className="inline w-4 h-4 mr-2"/>{isGenerating?'Đang tạo PDF…':'Tải văn bản PDF'}</button>
  </>}
 </div></div>;
};
