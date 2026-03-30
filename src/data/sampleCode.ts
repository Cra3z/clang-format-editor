/** 用于代码预览面板的示例 C++ 代码 */
export const sampleCode = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

namespace MyProject {
namespace Utils {

template <typename T>
concept Sortable = requires(T a, T b) {
  { a < b } -> std::convertible_to<bool>;
};

enum class Color {
  Red,
  Green,
  Blue,
  Alpha
};

class MyClass : public BaseClass,
                public Interface {
public:
  MyClass() : value_(0), name_("default") {}

  explicit MyClass(int value, const std::string &name)
      : value_(value), name_(name) {}

  ~MyClass() override = default;

  int getValue() const { return value_; }
  void setValue(int value) { value_ = value; }

  const std::string &getName() const { return name_; }

  void process(int a, int b, int c,
               int d, int e) {
    if (a > b) {
      doSomething();
    } else if (a == b) {
      doSomethingElse();
    } else {
      doNothing();
    }

    for (int i = 0; i < 10; ++i) {
      if (i % 2 == 0)
        continue;
      processItem(i);
    }

    switch (a) {
    case 1:
      handleCase1();
      break;
    case 2:
      handleCase2();
      break;
    default:
      handleDefault();
      break;
    }

    auto lambda = [this](int x) {
      return x * value_;
    };

    std::vector<int> vec = {1, 2, 3, 4, 5};
    std::sort(vec.begin(), vec.end(),
              [](int a, int b) { return a > b; });

    while (condition()) {
      step();
    }

    do {
      retry();
    } while (!success());

    int result = (a > 0) ? computePositive(a)
                         : computeNegative(a);

    int x     = 10;
    int yy    = 20;
    int zzz   = 30;
    double w  = 40.0;
  }

protected:
  virtual void doSomething() = 0;

private:
  int value_;
  std::string name_;

  void doSomethingElse() {
    // Implementation
  }

  void doNothing() {}
};

struct Point {
  double x;
  double y;
  double z;
};

template <typename T>
  requires Sortable<T>
void sortItems(std::vector<T> &items) {
  std::sort(items.begin(), items.end());
}

} // namespace Utils
} // namespace MyProject

int main(int argc, char *argv[]) {
  MyProject::Utils::MyClass obj(42, "test");
  obj.process(1, 2, 3, 4, 5);

  std::vector<int> numbers = {5, 3, 1, 4, 2};
  MyProject::Utils::sortItems(numbers);

  for (const auto &n : numbers) {
    std::cout << n << " ";
  }
  std::cout << std::endl;

  return 0;
}
`
