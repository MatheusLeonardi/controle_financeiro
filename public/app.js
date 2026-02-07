const monthInput = document.getElementById("month");
const loadMonthButton = document.getElementById("loadMonth");
const entryForm = document.getElementById("entryForm");
const entriesContainer = document.getElementById("entries");
const summaryIncome = document.getElementById("summaryIncome");
const summaryExpense = document.getElementById("summaryExpense");
const summaryBalance = document.getElementById("summaryBalance");

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0);

const renderEntries = (entries) => {
  entriesContainer.innerHTML = "";

  if (!entries.length) {
    entriesContainer.innerHTML = "<p class='muted'>Nenhum lançamento neste mês.</p>";
    return;
  }

  entries.forEach((entry) => {
    const wrapper = document.createElement("div");
    wrapper.className = "entry";

    wrapper.innerHTML = `
      <div>
        <p class="type ${entry.type}">${entry.type}</p>
        <strong>${entry.description}</strong>
        <span>${new Date(entry.created_at).toLocaleDateString("pt-BR")}</span>
      </div>
      <strong>${formatCurrency(entry.amount)}</strong>
    `;

    entriesContainer.appendChild(wrapper);
  });
};

const loadSummary = async (month) => {
  const response = await fetch(`/api/summary?month=${month}`);
  const summary = await response.json();

  summaryIncome.textContent = formatCurrency(summary.receita);
  summaryExpense.textContent = formatCurrency(summary.gasto);
  summaryBalance.textContent = formatCurrency(summary.saldo);
};

const loadEntries = async (month) => {
  const response = await fetch(`/api/entries?month=${month}`);
  const entries = await response.json();
  renderEntries(entries);
};

const refreshMonth = async () => {
  const month = monthInput.value;
  if (!month) {
    alert("Selecione o mês desejado.");
    return;
  }

  await Promise.all([loadEntries(month), loadSummary(month)]);
};

loadMonthButton.addEventListener("click", refreshMonth);

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const month = monthInput.value;

  if (!month) {
    alert("Selecione o mês desejado antes de salvar.");
    return;
  }

  const formData = new FormData(entryForm);
  const payload = {
    month,
    type: formData.get("type"),
    description: formData.get("description"),
    amount: Number(formData.get("amount"))
  };

  const response = await fetch("/api/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.error || "Erro ao salvar.");
    return;
  }

  entryForm.reset();
  await refreshMonth();
});

const currentMonth = new Date().toISOString().slice(0, 7);
monthInput.value = currentMonth;
refreshMonth();
