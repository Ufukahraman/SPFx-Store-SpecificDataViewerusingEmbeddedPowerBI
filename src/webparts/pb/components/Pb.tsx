//DENEME 4

import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import * as React from 'react';
import type { IPbProps } from './IPbProps';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { Report } from 'powerbi-client';
import styles from './Pb.module.scss';
import axios from 'axios';


interface IState {
  newtoken: string;
  magazaKodu : string; 
  report: any;
}


export default class Pb extends React.Component<IPbProps, IState> {
  constructor(props: IPbProps) {
    super(props);
    
    this.state = {
      newtoken: "", 
      magazaKodu : "",
      report: null,
    };


  }
  componentDidMount(): void {
    this.initialize(); 
  }

  getData = (): void => {
    const user = this.props.context.pageContext.user.email
    const listName = "Magazalar"; // Listenizin adını buraya ekleyin
    const columns = [
      "Mail",
      "MagazaAdi"
    ];

    this.props.context.spHttpClient
      .get(
        `${this.props.context.pageContext.web.absoluteUrl
        }/_api/web/lists/getbytitle('${listName}')/items?$select=${columns.join(
          ","
        )}`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept: "application/json;odata=nometadata",
            "Content-type": "application/json;odata=nometadata",
            "odata-version": "",
          },
        }
      )
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          response.json().then((responseJSON) => {
            if (responseJSON.value) { // 'value' özelliğinin var olduğunu kontrol et


              const magazauser = responseJSON.value.find((item: any) => {
                return item.Mail === user;
              });

              if (magazauser) {
                this.setState({ magazaKodu: magazauser.MagazaAdi}, () => {
                });
              }
              else{
                this.setState({magazaKodu :""}); 
              }

            } else {

              console.log("kullanıcı bulunamadı lütfen desteğe başvurunuz"); 
            }
          });
        }
      })
      .catch((error: any) => {
        console.log(error); 
      });
  };

  getToken = async (): Promise<void> => {
    try {
      const response = await axios.get('https://satinalmaformu.com/token');



      if (response.status === 200) {

        this.setState({ newtoken: response.data.token }); 
        console.log(response.data.token)


      } else {
        console.error(response.data);
        alert(`Bir terslik var.`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  initialize = async (): Promise<void> => {
    try {
      await this.getToken();
      await this.getData();


    } catch (error) {
      console.error("Error during initialization:", error);
    }
  };



  public render(): React.ReactElement<IPbProps> {
    const a = this.state.magazaKodu ; 
    let report = null;
    if (this.state.magazaKodu) {   
      report = ( 
      <PowerBIEmbed 
      embedConfig={{
        type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
        id: 'd0f32b30-8cb82543185CCA619f', 
        embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=d0f32b30-8ccb-4a19f&groupId=7177e00e-5d6c-439e-9e9f-567bc&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVdFU1QtRVVST1BFLUYtUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCI5leHQiOnRydWV9fQ%3d%3d',
        accessToken: this.state.newtoken, 
        tokenType: models.TokenType.Aad,      
 

        settings: {

          panes: {
            filters: {

              expanded: false, 
              visible: false,

            }


          },


        },


      }}

      eventHandlers={
        new Map([ 
          //------------------------------------------------------------------------------------------------------
          ['loaded', async function () {
              
              const report = (window as any).report;
              const filter = {
                $schema: "http://powerbi.com/product/schema#basic",
                target: {
                  hierarchy: "AddressHierarchy",
                  hierarchyLevel: "StoreDescription", 
                  table: "Location" 
                },
                operator: "In",
                values: [a], 
                filterType: models.FilterType.Basic     
              };

              report.setFilters([filter])
                .catch((errors: any) => {
                  console.error(errors);
                });

              try {
                await report.updateFilters(models.FiltersOperations.Add, [filter]);  

              }
              catch (errors) {
                console.log(errors);
              }

            


          }],

          //------------------------------------------------------------------------------------------------------
          ['rendered', async function () {


          }],





          ['error', function (event: any) {  }], 
          
          
        ])
      }

      cssClassName={styles.rapor}



      getEmbeddedComponent={(embeddedReport) => {
        (window as any).report = embeddedReport as Report;





      }}
    />
      )

    }

    else{
      report =(
        <div className={styles.bildirim}>
        Bu raporu sadece Mağazalar görebilir, eğer bir mağaza kullanıcısı ile giriş yapmanıza rağmen görüntüleyemiyorsanız lütfen desteğe başvurun.
        </div>  

      )
    }
   
   
      return (

      <div className={styles.custom}>
        <div className={styles.container}> 

        {report}

        </div>
      </div>
    );
  }
}
