import { fetchRestaurantMenu } from "../../services/menuService";
import MenuClient from "../../components/Customer/MenuClient";

export default async function CafeMenuPage() {
  // Server-side fetching using the Service Architecture (No tenant ID needed)
  const response = await fetchRestaurantMenu();

  if (!response.success) {
    return (
      <main className="flex-center" style={{ minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
        <div className="glass-panel" style={{ padding: "3rem 2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--danger)" }}>Error</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Could not load the menu.
          </p>
        </div>
      </main>
    );
  }

  // Pass the successfully fetched data to the interactive client component
  return <MenuClient restaurantData={response.data} />;
}
