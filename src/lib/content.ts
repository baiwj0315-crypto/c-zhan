import { QUESTIONS as QUESTION_BANK } from "@/lib/questions";

export const DAILY_GOAL = 18;

export type Level = "基础" | "提高";

export type Card = {
  id: string;
  chapter: number;
  level: Level;
  term: string;
  gloss: string;
  explain: string;
  example?: string;
};

export type QuestionKind = "choice" | "judge" | "fill" | "output";

export type QuestionSource = "改编" | "练习风格" | "原题风格";

export type Question = {
  id: string;
  chapter: number;
  /** 缺省视为 choice，兼容旧题 */
  kind?: QuestionKind;
  prompt: string;
  code?: string;
  /** choice / judge / output（选项呈现） */
  options?: string[];
  /** 正确选项下标 */
  answer?: number;
  /** fill / output（填空呈现）可接受的等价答案 */
  answers?: string[];
  explain: string;
  /** 关联知识点 card id */
  cardIds: string[];
  source?: QuestionSource;
};

export const CHAPTERS = [
  { id: 1, title: "基础知识", blurb: "程序从哪开始，数据怎么放" },
  { id: 2, title: "顺序结构", blurb: "先输入，再计算，再输出" },
  { id: 3, title: "分支结构", blurb: "条件不同，走的路就不同" },
  { id: 4, title: "循环结构", blurb: "同一件事，重复到条件变了" },
  { id: 5, title: "数组", blurb: "一组同类型的数据，靠下标找" },
  { id: 6, title: "指针", blurb: "手里拿的是地址，不是值本身" },
  { id: 7, title: "函数", blurb: "一件事写成一块，用的时候再调用" },
  { id: 8, title: "结构体", blurb: "不同类型捆成一条记录" },
  { id: 9, title: "文件", blurb: "程序结束以后，数据还在" },
  { id: 10, title: "位运算", blurb: "直接动二进制里的某一位" },
] as const;

export const CARDS: Card[] = [
  {
    id: "c1-1",
    chapter: 1,
    level: "基础",
    term: "主函数",
    gloss: "程序从 main 开始，也从这里结束",
    explain:
      "一个 C 程序由函数组成，有且只有一个主函数，名字必须是 main。执行从 main 的第一条语句开始。本书按 C99，主函数写成 int main(void)，正常结束时 return 0。C 区分大小写，写成 Main 就不是主函数。",
    example: `#include <stdio.h>
int main(void)
{
    printf("hello\\n");
    return 0;
}`,
  },
  {
    id: "c1-2",
    chapter: 1,
    level: "基础",
    term: "整型除法",
    gloss: "两个整数相除，小数被丢掉",
    explain:
      "两边都是整数时，商仍是整数。11/2 的值是 5，不是 5.5。只要有一边是实数，例如 11/2.0，才按实数相除，得到 5.5。把整数商赋给 double，得到的也只是 5.0。",
    example: `int sum = 11;
double ave;
ave = sum / 2;    /* 5.0 */
ave = sum / 2.0;  /* 5.5 */`,
  },
  {
    id: "c1-3",
    chapter: 1,
    level: "基础",
    term: "字符与 ASCII",
    gloss: "字符在机器里就是一个整数",
    explain:
      "字符常量用单引号。'a' 的 ASCII 码是 97，'A' 是 65，同一字母大小写相差 32。所以 'a'-32 得到 'A'。数字字符 '5' 的码是 53，'0' 是 48，'5'-'0' 正好是数字 5。",
    example: `char ch = 'a';
ch = ch - 32;     /* 'A' */
int n = '5' - '0'; /* 5 */`,
  },
  {
    id: "c1-4",
    chapter: 1,
    level: "基础",
    term: "变量",
    gloss: "先定义，再使用；名字代表那一块存储",
    explain:
      "变量名由字母、数字和下画线组成，不能以数字开头，不能用关键字。定义是向系统要一块存储，必须写在本函数其他语句之前。只定义不赋值，里面的值是不确定的。再次赋值会盖掉旧值。",
    example: `int a = 5;
a = a + 10; /* 左边是名，右边先取旧值 */`,
  },
  {
    id: "c1-5",
    chapter: 1,
    level: "提高",
    term: "符号常量",
    gloss: "#define 给一个固定的量起名字",
    explain:
      "#define TMP 1000 后面不加分号。预处理时会把后面的 TMP 换成 1000。它不是变量，不能写 TMP = 5。适合长度、人数上限这种整份程序都要用、又不该被改掉的数。",
    example: `#define TMP 1000
int s = TMP + 50;`,
  },
  {
    id: "c2-1",
    chapter: 2,
    level: "基础",
    term: "printf",
    gloss: "双引号里照样输出，格式符的位置填数据",
    explain:
      "格式符是占位，不是原文。%d 输出 int，%f 输出 float，本书用 %lf 输出 double，%c 输出字符，%s 输出字符串。双引号里其余字符原样出现。类型和格式符不一致时，输出会错，甚至不是你要的那个数。",
    example: `printf("sum=%d, ave=%lf\\n", sum, ave);`,
  },
  {
    id: "c2-2",
    chapter: 2,
    level: "基础",
    term: "scanf 与 &",
    gloss: "输入函数要知道往哪一块内存里写",
    explain:
      "scanf 的格式串说明你期待什么，后面要给出变量的地址。普通变量前加 &。漏掉 &，程序不是“读进变量”，而是按一个乱地址去写。字符串数组名本身就是地址，读字符串时不要再加 &。",
    example: `int score;
scanf("%d", &score);`,
  },
  {
    id: "c2-3",
    chapter: 2,
    level: "基础",
    term: "赋值",
    gloss: "一个等号是写入，两个等号才是比较",
    explain:
      "a = b + 1 的意思是：先算出右边，再放进左边。左边必须是变量。a == b 才是在问“相不相等”，结果是 1 或 0。把比较写成一个等号，往往能通过编译，但意思已经变了。",
    example: `score = score + 5; /* 写入 */
if (score == 60)  /* 比较 */`,
  },
  {
    id: "c2-4",
    chapter: 2,
    level: "基础",
    term: "换行符",
    gloss: "\\n 不是两个字符，是“换到下一行”",
    explain:
      "printf 不会自动换行。要分行，就在字符串里写 \\n。它是一个转义字符。讨论题里最后一个输出的 \\n，作用就是输出结束后把光标推到下一行，避免和后面的提示贴在一起。",
    example: `printf("第一行\\n");
printf("第二行\\n");`,
  },
  {
    id: "c3-1",
    chapter: 3,
    level: "基础",
    term: "关系表达式",
    gloss: "比较的结果只有 1 或 0",
    explain:
      "关系运算符有 >、>=、<、<=、==、!=。成立时值为 1，不成立时为 0。所以它本身就是一个值，可以放进 if，也可以参加别的运算。不要写成数学里的 0 < x < 10，那不会按你想的同时判断两边。",
    example: `if (score >= 60 && score < 90)`,
  },
  {
    id: "c3-2",
    chapter: 3,
    level: "基础",
    term: "逻辑运算",
    gloss: "并且、或者、不是",
    explain:
      "&& 两边都真才真，|| 有一边真就真，! 把真假反过来。C 里 0 是假，非 0 都是真。&& 和 || 会短路：左边已经能决定结果时，右边不算。所以可以写成 n != 0 && 10/n > 1，避免除以 0。",
    example: `if (n != 0 && sum / n >= 60)`,
  },
  {
    id: "c3-3",
    chapter: 3,
    level: "基础",
    term: "if 与 else",
    gloss: "else 跟最近的那个还没配对的 if",
    explain:
      "if 后面只管辖下一条语句；要管多条，必须用花括号。else 与最近的 if 配对。想让 else 属于外层 if，内层 if 就要自己写上花括号。条件写成 a = 0 是赋值，值是 0，这条 if 永远进不去。",
    example: `if (score >= 60)
    printf("及格\\n");
else
    printf("不及格\\n");`,
  },
  {
    id: "c3-4",
    chapter: 3,
    level: "基础",
    term: "switch",
    gloss: "相等才分流，忘了 break 会一直往下掉",
    explain:
      "switch 用一个整数或字符去对 case 后面的常量。匹配之后，如果没有 break，会继续执行后面的 case，这叫贯穿。default 负责“以上都不是”。适合成绩等级、菜单选项这种离散的相等判断。",
    example: `switch (grade) {
case 'A': printf("优\\n"); break;
case 'B': printf("良\\n"); break;
default:  printf("其他\\n");
}`,
  },
  {
    id: "c4-1",
    chapter: 4,
    level: "基础",
    term: "for",
    gloss: "初值、条件、步进，三件套",
    explain:
      "for (初值; 条件; 步进) 先做初值一次，再判断条件，为真就执行循环体，然后步进，再判断。累加 1 到 n、数个数，多数写成 for。三件套都可以空，但分号不能省。循环变量如果还要在循环外使用，要在 for 外面定义。",
    example: `int s = 0, i;
for (i = 1; i <= n; i++)
    s = s + i;`,
  },
  {
    id: "c4-2",
    chapter: 4,
    level: "基础",
    term: "while 与 do-while",
    gloss: "一个先问再做，一个先做再问",
    explain:
      "while 先判断，条件一开始就假，循环体一次都不执行。do-while 先执行循环体，再判断，所以至少做一次。菜单“至少显示一次，再问要不要继续”适合 do-while。注意 do-while 的括号后面有分号。",
    example: `do {
    scanf("%d", &n);
} while (n <= 0);`,
  },
  {
    id: "c4-3",
    chapter: 4,
    level: "基础",
    term: "break 与 continue",
    gloss: "一个离开循环，一个跳过这一轮",
    explain:
      "break 立刻结束它所在的那一层循环。continue 结束本轮循环体里剩下的语句：在 for 里接着做步进，在 while 里回到条件。它们都不影响循环外面的语句。嵌套循环里，break 只跳出一层。",
    example: `if (score < 0) break;
if (score < 60) continue;`,
  },
  {
    id: "c4-4",
    chapter: 4,
    level: "提高",
    term: "累加与计数",
    gloss: "两件事先想清楚：从哪开始，每轮加什么",
    explain:
      "求和：累加器先清 0，每轮加上当前项。计数：计数器先清 0，满足条件才加 1。先写出“第一轮结束后变量里该有什么”，再写循环，比一上来就嵌三层容易对。这是后面成绩统计会反复用的骨架。",
    example: `int s = 0, c = 0, i;
for (i = 0; i < n; i++) {
    s = s + a[i];
    if (a[i] >= 60) c++;
}`,
  },
  {
    id: "c5-1",
    chapter: 5,
    level: "基础",
    term: "一维数组",
    gloss: "下标从 0 开始，最后一项是 n-1",
    explain:
      "int a[5] 有 5 个 int，合法下标是 0 到 4。a[5] 已经越界，编译器不一定报错，但结果没有保证。数组长度用常量，定义后大小不能再变。没写初值的元素不要拿去算，除非你自己先赋过值。",
    example: `int a[5];
a[0] = 90;
/* 最后一项是 a[4] */`,
  },
  {
    id: "c5-2",
    chapter: 5,
    level: "基础",
    term: "数组初始化",
    gloss: "花括号里没写到的，补 0",
    explain:
      "int a[5] = {1, 2}; 前两个是 1 和 2，后面三个是 0。int a[] = {1, 2, 3}; 长度由花括号决定，是 3。全部清零可以写 int a[5] = {0};。初始化是定义时的事，后面再改要用赋值或循环。",
    example: `int a[5] = {1, 2}; /* 1,2,0,0,0 */`,
  },
  {
    id: "c5-3",
    chapter: 5,
    level: "基础",
    term: "字符串",
    gloss: "一串字符，最后多一个 \\\\0",
    explain:
      "字符串常量用双引号。char s[] = \"Hi\"; 实际占 3 个字节：'H'、'i'、'\\0'。strlen 不计结尾的 '\\0'，所以长度是 2。用 %s 输出、用 %s 读入时，都靠这个结尾判断哪里停。读入前要保证数组够长，还要留一个位置给 '\\0'。",
    example: `char s[] = "Hi";
printf("%s\\n", s);`,
  },
  {
    id: "c5-4",
    chapter: 5,
    level: "基础",
    term: "二维数组",
    gloss: "先行后列，像一张表",
    explain:
      "int a[2][3] 是 2 行 3 列，元素按行存放。a[1][2] 是第 2 行第 3 列（都从 0 数）。成绩表里“第 i 个学生的第 j 门课”就可以放进 a[i][j]。遍历时外层循环走路，内层循环走列。",
    example: `int a[2][3] = {{1, 2, 3}, {4, 5, 6}};
/* a[1][0] 是 4 */`,
  },
  {
    id: "c6-1",
    chapter: 6,
    level: "基础",
    term: "指针",
    gloss: "指针变量里存的是地址",
    explain:
      "每个变量都有地址。&a 取出 a 的地址，int *p 表示 p 是指向 int 的指针。p = &a 之后，*p 就是 a 本身：读 *p 等于读 a，写 *p 等于写 a。定义里的 * 是类型的一部分，使用时的 * 才是“取出它指向的值”。",
    example: `int a = 3;
int *p = &a;
*p = 8; /* a 变成 8 */`,
  },
  {
    id: "c6-2",
    chapter: 6,
    level: "基础",
    term: "指针与数组",
    gloss: "数组名在多数表达式里就是首元素地址",
    explain:
      "int a[5]; 则 a 的值与 &a[0] 相同。p = a 之后，*(p+i) 就是 a[i]，也可以写成 p[i]。函数参数写成 int a[] 时，传进去的也是地址，函数里并不知道原来有多长，长度要另外传。",
    example: `int a[3] = {1, 2, 3};
int *p = a;
printf("%d\\n", *(p + 1)); /* 2 */`,
  },
  {
    id: "c6-3",
    chapter: 6,
    level: "提高",
    term: "指针加减",
    gloss: "加 1 跨过一个元素，不是一个字节",
    explain:
      "int *p 做 p+1，地址增加的是一个 int 的大小，于是正好落到下一个 int。char * 加 1 才是挪一个字节。所以同一块内存，指针类型不同，p+1 的含义就不同。不要用空指针去加减或解引用。",
    example: `int a[3] = {10, 20, 30};
int *p = a;
p = p + 1; /* 指向 20 */`,
  },
  {
    id: "c6-4",
    chapter: 6,
    level: "基础",
    term: "指针与字符串",
    gloss: "可以让指针沿字符串往后走",
    explain:
      "char *p = \"Hi\"; p 指向第一个字符。*p 是 'H'，p+1 指向 'i'，再往后是 '\\0'。用指针扫描字符串时，循环条件常常写成 *p，因为 '\\0' 的值是 0，循环会停。字符串常量的内容不要去改。",
    example: `char *p = "Hi";
while (*p) {
    putchar(*p);
    p++;
}`,
  },
  {
    id: "c7-1",
    chapter: 7,
    level: "基础",
    term: "函数定义",
    gloss: "返回类型、名字、参数、函数体",
    explain:
      "定义给出函数真正的做法。调用发生在定义之前时，要先写原型说明，让编译器知道参数和返回类型。没有返回值就写 void。return 后面的表达式类型应和返回类型一致，return 执行后函数立刻结束。",
    example: `int mysum(int m, int n);
int mysum(int m, int n)
{
    return m + n;
}`,
  },
  {
    id: "c7-2",
    chapter: 7,
    level: "基础",
    term: "值传递",
    gloss: "实参拷一份给形参，改形参不影响实参",
    explain:
      "调用时，实参的值赋给形参。函数里给形参重新赋值，改的是那一份拷贝。想让函数改掉调用者的变量，要传这个变量的地址，函数里用指针写回去。这是“交换两个变量”一开始总写不对的原因。",
    example: `void add(int x) { x = x + 1; }
/* 调用 add(a) 后，a 不变 */`,
  },
  {
    id: "c7-3",
    chapter: 7,
    level: "基础",
    term: "数组作参数",
    gloss: "传进去的是地址，长度要另给",
    explain:
      "void f(int a[], int n) 里的 a 是指针。函数里对 a[i] 的修改，调用者能看见，因为改的是同一块内存。但 sizeof 得不到元素个数，所以把 n 一起传进去。二维数组作参数时，列数必须写在形参里。",
    example: `int sum(int a[], int n)
{
    int s = 0, i;
    for (i = 0; i < n; i++) s += a[i];
    return s;
}`,
  },
  {
    id: "c7-4",
    chapter: 7,
    level: "提高",
    term: "递归",
    gloss: "函数调用它自己，一定要有停下来的那一层",
    explain:
      "递归每次把问题变小，并在最小的情况直接给出答案。阶乘：0 或 1 的阶乘是 1，其余是 n * (n-1) 的阶乘。没有停止条件，调用会一直叠下去，直到栈溢出。能用循环写清楚的，初学阶段优先用循环。",
    example: `int fact(int n)
{
    if (n <= 1) return 1;
    return n * fact(n - 1);
}`,
  },
  {
    id: "c8-1",
    chapter: 8,
    level: "基础",
    term: "结构体",
    gloss: "一条记录里可以有不同类型的成员",
    explain:
      "先声明类型，再定义变量。成员用点号访问。适合“一个学生有学号、姓名、成绩”这种数据。数组要求元素类型相同，结构体不要求。可以在定义时用花括号按成员顺序初始化。",
    example: `struct Stu {
    int id;
    double score;
};
struct Stu a = {1, 92.5};
printf("%lf\\n", a.score);`,
  },
  {
    id: "c8-2",
    chapter: 8,
    level: "基础",
    term: "结构体指针",
    gloss: "有指针时，用箭头访问成员",
    explain:
      "struct Stu *p = &a; 之后，(*p).score 和 p->score 是同一个成员。有指针就优先写箭头，少写一层括号。函数要修改调用者的那条记录时，传结构体的地址，比整份拷贝省事，也真的能改回去。",
    example: `void setScore(struct Stu *p, double s)
{
    p->score = s;
}`,
  },
  {
    id: "c8-3",
    chapter: 8,
    level: "基础",
    term: "结构体数组",
    gloss: "很多条记录，用下标选中某一条",
    explain:
      "struct Stu a[30]; 就是 30 个学生。第 i 个学生的成绩是 a[i].score。排序、查找、求平均，都是在这个数组上做循环。这是成绩管理程序从“几个变量”长成“一班学生”的那一步。",
    example: `a[0].id = 1;
a[0].score = 88;
printf("%d\\n", a[0].id);`,
  },
  {
    id: "c8-4",
    chapter: 8,
    level: "提高",
    term: "链表",
    gloss: "结点里除了数据，还有下一结点的地址",
    explain:
      "数组长度要事先定好。链表用指针把结点串起来，需要时再申请一个结点，插到链上。访问第 i 个结点不能像数组那样一步跳到，只能从头顺着 next 走。本书提高部分用它说明“指针不只为了改一个变量”。",
    example: `struct Node {
    int data;
    struct Node *next;
};`,
  },
  {
    id: "c9-1",
    chapter: 9,
    level: "基础",
    term: "文件指针",
    gloss: "FILE * 代表已经打开的那个文件",
    explain:
      "磁盘文件不是一个普通变量。fopen 成功后返回 FILE *，后面的读写都拿这个指针去找文件。fopen 失败返回 NULL，不检查就继续读，程序会崩。用完必须 fclose，把缓冲区里的内容真正写出去，并释放这个指针。",
    example: `FILE *fp = fopen("score.txt", "r");
if (fp == NULL) return 1;
fclose(fp);`,
  },
  {
    id: "c9-2",
    chapter: 9,
    level: "基础",
    term: "打开方式",
    gloss: "r 读，w 写并且先清空，a 追加到末尾",
    explain:
      "\"r\" 要求文件已经存在。\"w\" 没有就新建，有就把原内容清掉，再写入。\"a\" 在末尾接着写，不清空。文本方式读写成绩表，读用 \"r\"，第一次保存用 \"w\"，以后只追加记录才用 \"a\"。写错模式，原文件会被清掉。",
    example: `fp = fopen("score.txt", "w");`,
  },
  {
    id: "c9-3",
    chapter: 9,
    level: "基础",
    term: "fprintf 与 fscanf",
    gloss: "跟 printf、scanf 一样，只是多一个文件指针",
    explain:
      "fprintf(fp, \"%d %lf\\n\", id, score) 把数据按格式写进文件。fscanf(fp, \"%d %lf\", &id, &score) 按同样的格式读回来。读的时候普通变量仍然要加 &。读到文件尾，fscanf 的返回值不再等于你要求的项数，循环应停。",
    example: `fprintf(fp, "%d %lf\\n", a.id, a.score);
fscanf(fp, "%d %lf", &a.id, &a.score);`,
  },
  {
    id: "c9-4",
    chapter: 9,
    level: "提高",
    term: "文件位置",
    gloss: "读写都有一个当前位置，可以把它挪走",
    explain:
      "每读一项或写一项，文件位置就往后移。rewind(fp) 或 fseek(fp, 0, SEEK_SET) 回到文件开头，于是可以先写完再从头读。随机找某一条记录时才需要按字节偏移；文本文件的一行长短不固定，初学先按顺序读写。",
    example: `rewind(fp); /* 回到开头 */`,
  },
  {
    id: "c10-1",
    chapter: 10,
    level: "基础",
    term: "移位",
    gloss: "左移乘二的幂，右移除二的幂",
    explain:
      "对无符号或非负的小整数，<< n 相当于乘以 2 的 n 次方，>> n 相当于除以 2 的 n 次方并丢掉余数。1 << 3 是 8。移出去的位消失，另一侧补 0（对无符号而言）。不要对负数的右移结果死记，那和编译器有关。",
    example: `int a = 1 << 3; /* 8 */
int b = 16 >> 2; /* 4 */`,
  },
  {
    id: "c10-2",
    chapter: 10,
    level: "基础",
    term: "按位与或异或",
    gloss: "每一位单独做逻辑，不进位",
    explain:
      "& 两位都是 1 才是 1。| 有一个 1 就是 1。^ 相同为 0，不同为 1。它们看的是二进制，不是“逻辑上的真假”：6 & 3 是 2，因为 110 和 011 只有最低位那个位置需要你逐位对。不要和 &&、|| 混用。",
    example: `/* 6 是 110，3 是 011 */
6 & 3  /* 2 */
6 | 3  /* 7 */
6 ^ 3  /* 5 */`,
  },
  {
    id: "c10-3",
    chapter: 10,
    level: "基础",
    term: "按位取反",
    gloss: "~ 把每一位 0 和 1 对调",
    explain:
      "~ 是一元运算符，优先级高。它不是逻辑非 !。! 只把“真/假”反过来，~ 把所有二进制位反过来。因为 int 有很多位，~0 不是 1，而是所有位都变成 1 的那个数（在有符号里通常显示为 -1）。",
    example: `unsigned int x = 0u;
/* ~x 的每一位都是 1 */`,
  },
  {
    id: "c10-4",
    chapter: 10,
    level: "提高",
    term: "掩码",
    gloss: "用一个只在目标位上为 1 的数去 &",
    explain:
      "想知道某一位是不是 1，就造一个只有那一位是 1 的掩码，再做 &。结果非 0 说明那一位是 1。掩码常用 1 << k。想把某一位清 0，用 & 上该位为 0、其余位为 1 的数。这是位运算在“状态开关”里的用法。",
    example: `int flags = 5;          /* 101 */
int on = flags & (1 << 2); /* 第 2 位是 1 */`,
  },
];

export const QUESTIONS: Question[] = QUESTION_BANK;

const cardMap = new Map(CARDS.map((card) => [card.id, card]));
const questionMap = new Map(QUESTIONS.map((question) => [question.id, question]));

export function cardById(id: string): Card | null {
  return cardMap.get(id) ?? null;
}

export function questionById(id: string): Question | null {
  return questionMap.get(id) ?? null;
}

export function chapterTitle(id: number): string {
  return CHAPTERS.find((chapter) => chapter.id === id)?.title ?? "未分章";
}

export function questionKind(question: Question): QuestionKind {
  return question.kind ?? "choice";
}

/** 填空类：fill，或 output 且用 answers 呈现 */
export function isTextAnswer(question: Question): boolean {
  const kind = questionKind(question);
  if (kind === "fill") return true;
  if (kind === "output" && (!question.options || question.options.length === 0) && (question.answers?.length ?? 0) > 0) {
    return true;
  }
  return false;
}

export function normalizeFill(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkQuestionAnswer(
  question: Question,
  input: { choice?: number; text?: string },
): boolean {
  if (isTextAnswer(question)) {
    const got = normalizeFill(input.text ?? "");
    if (!got) return false;
    return (question.answers ?? []).some((item) => normalizeFill(item) === got);
  }
  const options = question.options ?? [];
  const choice = input.choice;
  if (choice === undefined || !Number.isInteger(choice) || choice < 0 || choice >= options.length) {
    return false;
  }
  return choice === question.answer;
}

export function correctLabel(question: Question): string {
  if (isTextAnswer(question)) {
    return (question.answers ?? [])[0] ?? "";
  }
  const options = question.options ?? [];
  const index = question.answer ?? 0;
  return options[index] ?? "";
}

export function queueFor(
  chapter: number,
  cut: ReadonlySet<string>,
  review: ReadonlySet<string>,
  passed: ReadonlySet<string>,
): Card[] {
  const scoped = chapter > 0 ? CARDS.filter((card) => card.chapter === chapter) : CARDS;
  const fresh = scoped.filter((card) => !cut.has(card.id) && !review.has(card.id) && !passed.has(card.id));
  const again = scoped.filter((card) => review.has(card.id) && !passed.has(card.id));
  const merged = [...fresh, ...again];
  return chapter > 0 ? merged : merged.slice(0, DAILY_GOAL);
}
