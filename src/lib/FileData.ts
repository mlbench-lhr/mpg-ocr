// lib/FileData.ts

export interface FileDataProps {
    jobId?: string;
    pdfUrl: string;
    deliveryDate?: string;
    noOfPages?: number;
    FILE_ID?: string;
    FILE_NAME?: string;
    FILE_DATA?:string;
    OCR_BOLNO?: string;
    OCR_STMP_POD_DTT?: string;
    OCR_STMP_SIGN?: string;
    OCR_ISSQTY?: string;
    OCR_RCVQTY?: string;
    OCR_SYMT_DAMG?: string;
    OCR_SYMT_SHRT?: string;
    OCR_SYMT_ORVG?: string;
    OCR_SYMT_REFS?: string;
    customerOrderNum?: string;
    OCR_SYMT_NONE?: string;
    finalStatus?: string;
    reviewStatus?: string;
    recognitionStatus?: string;
    breakdownReason?: string;
    reviewedBy?: string;
    cargoDescription?: string;
    OCR_SYMT_SEAL?: string;
    uptd_Usr_Cd?: string;
    CRTD_DTT?: Date;
  }
  
  export class FileData implements FileDataProps {
    jobId = "";
    pdfUrl: string;
    deliveryDate = "";
    noOfPages = 0;
    FILE_ID = "";
    FILE_NAME = "";
    FILE_DATA="";
    OCR_BOLNO = "";
    OCR_STMP_POD_DTT = "";
    OCR_STMP_SIGN = "";
    OCR_ISSQTY = "";
    OCR_RCVQTY = "";
    OCR_SYMT_DAMG = "";
    OCR_SYMT_SHRT = "";
    OCR_SYMT_ORVG = "";
    OCR_SYMT_REFS = "";
    customerOrderNum = "";
    OCR_SYMT_NONE = "";
    finalStatus = "new";
    reviewStatus = "unConfirmed";
    recognitionStatus = "new";
    breakdownReason = "none";
    reviewedBy = "";
    cargoDescription = "";
    OCR_SYMT_SEAL = "";
    uptd_Usr_Cd = "OCR";
    CRTD_DTT = new Date();
  
    constructor(pdfUrl: string, overrides?: Partial<FileDataProps>) {
      this.pdfUrl = pdfUrl;
      if (overrides) Object.assign(this, overrides);
    }
    static fromPartial(data: Partial<FileDataProps>): FileData {
        const instance = new FileData(data.pdfUrl ?? "");
        Object.assign(instance, data);
        return instance;
      }
      static fromOracleRow(row: Record<string, any>, matchedMongoJob?: { _id?: string }): FileData {
        const pdfUrl = `${row.FILE_ID}.pdf`;
    
        return new FileData(pdfUrl, {
          // _id: matchedMongoJob?._id || row.FILE_ID,
    
          FILE_ID: row.FILE_ID ?? null,
          OCR_BOLNO: row.OCR_BOLNO ?? null,
          OCR_STMP_SIGN: row.OCR_STMP_SIGN ?? null,
          OCR_ISSQTY: row.OCR_ISSQTY ?? null,
          OCR_RCVQTY: row.OCR_RCVQTY ?? null,
          OCR_SYMT_DAMG: row.OCR_SYMT_DAMG ?? null,
          OCR_SYMT_SHRT: row.OCR_SYMT_SHRT ?? null,
          OCR_SYMT_ORVG: row.OCR_SYMT_ORVG ?? null,
          OCR_SYMT_REFS: row.OCR_SYMT_REFS ?? null,
          OCR_STMP_POD_DTT: row.OCR_STMP_POD_DTT ?? null,
          OCR_SYMT_SEAL: row.OCR_SYMT_SEAL ?? null,
          OCR_SYMT_NONE: row.OCR_SYMT_NONE ?? null,
          CRTD_DTT: row.CRTD_DTT ?? null,
          uptd_Usr_Cd: row.UPTD_USR_CD ?? "OCR",
    
          finalStatus: "new",
          reviewStatus: "unConfirmed",
          recognitionStatus: "new",
          breakdownReason: "none",
          customerOrderNum: "",
        });
      }
  }
  
  