export default function ThemeToggleButton() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      className="text-[13px] h-6 rounded-md aspect-square border text-(--color-sub) border-(--color-border) dark:text-(--color-sub) dark:border-(--color-border) hover:cursor-pointer hover:text-(--color-text) hover:border-(--color-border2) dark:hover:text-(--color-text) dark:hover:border-(--color-border2)"
      onClick={toggleTheme}
    >
      ◐
    </button>
  );
}
