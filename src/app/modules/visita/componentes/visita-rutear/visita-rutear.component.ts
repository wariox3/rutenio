import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

@Component({
  selector: 'app-visita-rutear',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="grid">
    <div class="card card-grid min-w-full">
      <div class="card-header py-5 flex-wrap">
        <h3 class="card-title">Static DataTable</h3>
        <label class="switch switch-sm">
          <input
            checked=""
            class="order-2"
            name="check"
            type="checkbox"
            value="1"
          />
          <span class="switch-label order-1"> Push Alerts </span>
        </label>
      </div>
      <div class="card-body">
        <div
          data-datatable="true"
          data-datatable-page-size="5"
          data-datatable-state-save="true"
          id="datatable_1"
        >
          <div class="scrollable-x-auto">
            <table
              class="table table-auto table-border"
              data-datatable-table="true"
            >
              <thead>
                <tr>
                  <th class="w-[100px] text-center">
                    <span class="sort asc">
                      <span class="sort-label"> Status </span>
                      <span class="sort-icon"> </span>
                    </span>
                  </th>
                  <th class="min-w-[185px]">
                    <span class="sort">
                      <span class="sort-label"> Last Session </span>
                      <span class="sort-icon"> </span>
                    </span>
                  </th>
                  <th class="w-[185px]">
                    <span class="sort">
                      <span class="sort-label"> Label </span>
                      <span class="sort-icon"> </span>
                    </span>
                  </th>
                  <th class="w-[185px]">
                    <span class="sort">
                      <span class="sort-label">
                        <span
                          class="pt-px"
                          data-tooltip="true"
                          data-tooltip-offset="0, 5px"
                          data-tooltip-placement="top"
                        >
                          <i
                            class="ki-outline ki-information-2 text-lg leading-none"
                          >
                          </i>
                          <span
                            class="tooltip max-w-48"
                            data-tooltip-content="true"
                          >
                            Merchant account providers
                          </span>
                        </span>
                        Method
                      </span>
                      <span class="sort-icon"> </span>
                    </span>
                  </th>
                  <th class="w-[60px]"></th>
                  <th class="w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-success"> </span>
                  </td>
                  <td>6 Aug, 2024</td>
                  <td>HR Dept</td>
                  <td>Basic auth</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-success"> </span>
                  </td>
                  <td>22 Jul 2024</td>
                  <td>Guy Hawkins</td>
                  <td>Web</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-danger"> </span>
                  </td>
                  <td>18 Jul, 2024</td>
                  <td>Sales Dept</td>
                  <td>SSH</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-success"> </span>
                  </td>
                  <td>15 Jul, 2024</td>
                  <td>Sales Dept</td>
                  <td>Kerberos</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-warning"> </span>
                  </td>
                  <td>30 Jul, 2024</td>
                  <td>Legal Dept</td>
                  <td>Token</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-warning"> </span>
                  </td>
                  <td>28 Jul, 2024</td>
                  <td>Finance Dept</td>
                  <td>API Key</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-success"> </span>
                  </td>
                  <td>16 Jul, 2024</td>
                  <td>Design Dept</td>
                  <td>FIDO U2F</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-danger"> </span>
                  </td>
                  <td>11 Aug, 2024</td>
                  <td>Compliance Dept</td>
                  <td>OpenID</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-success"> </span>
                  </td>
                  <td>19 Jul, 2024</td>
                  <td>Alice Smith</td>
                  <td>Biometric</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-success"> </span>
                  </td>
                  <td>6 Aug, 2024</td>
                  <td>HR Dept</td>
                  <td>Basic auth</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-success"> </span>
                  </td>
                  <td>22 Jul 2024</td>
                  <td>Guy Hawkins</td>
                  <td>Web</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-danger"> </span>
                  </td>
                  <td>18 Jul, 2024</td>
                  <td>Sales Dept</td>
                  <td>SSH</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-success"> </span>
                  </td>
                  <td>15 Jul, 2024</td>
                  <td>Sales Dept</td>
                  <td>Kerberos</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="badge badge-dot size-2 bg-warning"> </span>
                  </td>
                  <td>30 Jul, 2024</td>
                  <td>Legal Dept</td>
                  <td>Token</td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-notepad-edit"> </i>
                    </a>
                  </td>
                  <td>
                    <a class="btn btn-sm btn-icon btn-clear btn-light" href="#">
                      <i class="ki-outline ki-trash"> </i>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            class="card-footer justify-center md:justify-between flex-col md:flex-row gap-3 text-gray-600 text-2sm font-medium"
          >
            <div class="flex items-center gap-2">
              Show
              <select
                class="select select-sm w-16"
                data-datatable-size="true"
                name="perpage"
              ></select>
              per page
            </div>
            <div class="flex items-center gap-4">
              <span data-datatable-info="true"> </span>
              <div class="pagination" data-datatable-pagination="true"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  styleUrl: './visita-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaRutearComponent {
  ngOnInit(): void {}
}
