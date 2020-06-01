<script>
  import "../node_modules/materialize-css/dist/css/materialize.min.css";
  // import "../node_modules/materialize-css/dist/js/materialize.min.js";

  import { Router, Route } from "svelte-routing";

  import Navbar from "./layout/Navbar.svelte";
  import Home from "./pages/Home.svelte";
  import About from "./pages/About.svelte";
  import Footer from "./layout/Footer.svelte"
  import Business from "./pages/Business.svelte"
  import Tech from "./pages/Tech.svelte"
</script>

<style>

</style>

<Router>
  <Navbar />
  <div class="container">
    <Route path="/" component={Home} />
    <Route path="/business" component={Business} />
    <Route path="/technology" component={Tech} />
  </div>
  <Footer />
</Router>
