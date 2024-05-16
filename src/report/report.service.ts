import { TimeTrackingService } from './../time-tracking/time-tracking.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ProjectService } from 'src/project/project.service';
import { TaskService } from 'src/task/task.service';
import { UserprojectService } from 'src/userproject/userproject.service';
import * as puppeteer from "puppeteer"

@Injectable()
export class ReportService {

  constructor(
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
    private readonly userProjectService: UserprojectService,
    private readonly timeTrackingService: TimeTrackingService,
  ) { }


  private generateHTMLContent(content: Object): string {
    let html = `
      <html>
        <head>
          <style>
            /* CSS styling for the report */
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background-color: #f4f4f4;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              padding: 30px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              color: #333;
            }
            h2 {
              font-size: 20px;
              margin-bottom: 10px;
              color: #333;
            }
            p {
              font-size: 16px;
              margin-bottom: 10px;
              color: #666;
              margin-left:10px
            }
            .sub-section {
              margin-top: 20px;
              padding-left: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Project Report</h1>
    `;
  
    // Recursion for nested objects
    const generateNestedHTML = (obj: Record<string, any>): string => {
      let result = '';
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (typeof value === 'object') {
            // Value is object so call recursion
            result += `
              <div class="sub-section">
                <h2><strong>${key}</strong></h2>
                ${generateNestedHTML(value)}
              </div>
            `;
          } else {
            // Value is not object it has some value
            result += `<p>${key} : ${value}</p>`;
          }
        }
      }
      return result;
    };
  
    html += generateNestedHTML(content);
  
    html += `
          </div>
        </body>
      </html>
    `;
  
    return html;
  }
  

  async generatePDFReport(content: Object): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlContent = this.generateHTMLContent(content);
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
  }

  async generateReport(id: number) {
    try {
      const project = await this.projectService.findOne(id);
      const tasks = await this.taskService.getAllProjectTasks(id);
      const users = await this.userProjectService.getUsersFromProject(id)
      const completedTasks = tasks.filter((task) => task.status === 'completed');
      const task_length = tasks.length;
      const completed_task_length = completedTasks.length

      const taskTimeLine = await this.timeTrackingService.getByProject(id);

      const reportData = {
        Project: {
          Title: project.name,
          Manager: {
            Name: project.pm_id.name,
            Email: project.pm_id.email,
          },
          Client: {
            Email: project.clientEmail
          },
          Timeline: {
            Start_date: project.startDate ? project.startDate.toDateString() : 'Start date of project is not decided yet',
            Expected_end_date:project.expectedEndDate ? project.expectedEndDate.toDateString() : 'Expected end date of the project is not decided yet',
            Actual_end_date: project.actualEndDate ? project.actualEndDate.toDateString() : 'Project is currently in progress',
            Work_done: {
              By_task: taskTimeLine.result,
              Total_hours: taskTimeLine.totalHours,
            }
          },
          Status: project.status,
          Progress: JSON.stringify((completed_task_length / (task_length > 0 ? task_length : Infinity)) * 100) + "%"
        },
        Tasks: {
          Total_tasks: task_length,
          Completed_tasks: completed_task_length,
          Remaining_tasks: task_length - completed_task_length
        },
        Employees: {
          Total_employees: users.length
        }
      }
      return this.generatePDFReport(reportData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
