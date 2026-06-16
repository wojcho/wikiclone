import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import RegisterView from "./views/RegisterView";
import LoginView from "./views/LoginView";
import MainView from "./views/MainView";

import UserListView from "./views/user/UserListView";
import UserView from "./views/user/UserView";
import UserEditView from "./views/user/UserEditView";

import ArticleListView from "./views/article/ArticleListView";
import ArticleView from "./views/article/ArticleView";
import ArticleEditView from "./views/article/ArticleEditView";

import ImageListView from "./views/image/ImageListView";
import ImageView from "./views/image/ImageView";
import ImageEditView from "./views/image/ImageEditView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/register" element={<RegisterView />} />
        <Route path="/login" element={<LoginView />} />

        {/* app shell routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<MainView />} />

          <Route path="/users/" element={<UserListView />} />
          <Route path="/users/:id" element={<UserView />} />
          <Route path="/users/:id/edit" element={<UserEditView />} />

          <Route path="/articles/" element={<ArticleListView />} />
          <Route path="/articles/new" element={<ArticleEditView />} />
          <Route path="/articles/:id" element={<ArticleView />} />
          <Route path="/articles/:id/edit" element={<ArticleEditView />} />

          <Route path="/images/" element={<ImageListView />} />
          <Route path="/images/new" element={<ImageEditView />} />
          <Route path="/images/:id" element={<ImageView />} />
          <Route path="/images/:id/edit" element={<ImageEditView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
