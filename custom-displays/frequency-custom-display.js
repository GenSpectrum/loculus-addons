class FrequencyCustomDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.observer = new MutationObserver(() => this.render());
    this.showNoData = false;
  }

  connectedCallback() {
    this.render();
    this.observer.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  render() {
    const rawData = this.textContent.trim();

    let parsedData;
    try {
      parsedData = JSON.parse(rawData);
    } catch (error) {
      this.renderError("Invalid JSON data");
      return;
    }

    if (typeof parsedData !== 'object' || Array.isArray(parsedData)) {
      this.renderError("JSON must be an object with key-value pairs");
      return;
    }

    this.renderTable(parsedData);
  }

  renderError(message) {
    this.shadowRoot.innerHTML = `<p style="color: red;">${message}</p>`;
  }

  renderTable(data) {
    const container = document.createElement('div');
    container.classList.add('container');

    const checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add('checkbox-container');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'showNoData';
    checkbox.checked = this.showNoData;

    const label = document.createElement('label');
    label.htmlFor = 'showNoData';
    label.textContent = 'Show rows with no data';

    checkbox.addEventListener('change', (event) => {
      this.showNoData = event.target.checked;
      this.renderTable(data);
    });

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    container.appendChild(checkboxContainer);

    const table = document.createElement('table');
    container.appendChild(table);

    Object.entries(data).forEach(([key, value]) => {
      if (!this.showNoData && value === null) {
        return;
      }

      const row = document.createElement('tr');

      const keyCell = document.createElement('td');
      keyCell.textContent = key;

      const valueCell = document.createElement('td');
      valueCell.textContent = value !== null ? `${(value * 100).toFixed(2)}%` : 'no data';

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      table.appendChild(row);
    });

    const style = document.createElement('style');
    style.textContent = `
      .container {
        column-width: 12em;
      }
      .checkbox-container {
        margin-bottom: 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      td, th {
        border: 1px solid #ddd;
        padding: 1px 4px;
      }
      tr:nth-child(even) {
        background-color: #f2f2f2;
      }
    `;

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
  }
}

customElements.define('frequency-custom-display', FrequencyCustomDisplay);
